"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import ImageCropper from "@/components/ImageCropper"
import Modal from "@/components/Modal"
import html2canvas from "html2canvas"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

interface FormData {
  title: string
  releaseInfo: string
  tags: string
  score: number
  reviewText: string
}

const ReviewApp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>()
  const [reviewData, setReviewData] = useState({
    title: "",
    releaseInfo: "",
    tags: "",
    image: "",
    score: 0,
    reviewText: "",
  })
  const [showCropper, setShowCropper] = useState(false)
  const [tempImage, setTempImage] = useState("")
  const [charCount, setCharCount] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextareaChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    setCharCount((e.target as HTMLTextAreaElement).value.length)
  }

  // Watch for form changes and update reviewData
  React.useEffect(() => {
    const subscription = watch((value) => {
      setReviewData((prev) => ({ ...prev, ...value }))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setTempImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    setReviewData((prev) => ({ ...prev, image: croppedImageUrl }))
    setShowCropper(false)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImage("")
    setReviewData((prev) => ({ ...prev, image: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const generateAndDownloadImage = handleSubmit(
    () => {
      if (previewRef.current) {
        if (!reviewData.image) {
          toast({
            title: "Image Required",
            description: "Please upload an image for your review.",
            variant: "destructive",
          })
          return
        }

        html2canvas(previewRef.current, { scale: 2 }).then((canvas) => {
          const link = document.createElement("a")
          link.download = "review.png"
          link.href = canvas.toDataURL()
          link.click()
        })
      }
    },
    (errors) => {
      console.log(errors)
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
    }
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">\Review</h1>
          <Link
            href="https://github.com/sdnitrogen/review-app"
            target="_blank"
            className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Form */}
          <form className="w-full md:w-1/2 space-y-4 my-4">
            <Input
              {...register("title", { required: "Title is required" })}
              placeholder="Title"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}

            <Input
              {...register("releaseInfo", {
                required: "Release info is required",
              })}
              placeholder="Release Info"
            />
            {errors.releaseInfo && (
              <p className="text-red-500">{errors.releaseInfo.message}</p>
            )}

            <Input
              {...register("tags", {
                required: "At least one tag is required",
              })}
              placeholder="Tags (comma separated)"
            />
            {errors.tags && (
              <p className="text-red-500">{errors.tags.message}</p>
            )}

            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />

            <Input
              {...register("score", {
                required: "Score is required",
                min: { value: 0, message: "Score must be between 0 and 10" },
                max: { value: 10, message: "Score must be between 0 and 10" },
              })}
              type="number"
              placeholder="Score (0-10)"
              step="0.1"
            />
            {errors.score && (
              <p className="text-red-500">{errors.score.message}</p>
            )}

            <Textarea
              {...register("reviewText", {
                required: "Review text is required",
                maxLength: {
                  value: 300,
                  message: "Review must be 300 characters or less",
                },
              })}
              placeholder="Review (max 300 characters)"
              maxLength={300}
              onChange={handleTextareaChange}
            />
            <div
              className={`flex items-center justify-end text-sm ${
                charCount >= 300 ? "text-red-500" : "text-muted-foreground"
              }`}>
              {charCount}/300
            </div>
            {errors.reviewText && (
              <p className="text-red-500">{errors.reviewText.message}</p>
            )}

            <Button type="button" onClick={generateAndDownloadImage}>
              Download Review Image
            </Button>
          </form>

          {/* Preview */}
          <div className="w-full md:w-1/2">
            <div ref={previewRef} className="py-4">
              <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>{reviewData.title || "Title"}</CardTitle>
                  <p className="text-sm text-gray-500">
                    {reviewData.releaseInfo || "Release Info"}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reviewData.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewData.image && (
                    <Image
                      src={reviewData.image}
                      alt="Review"
                      width={0}
                      height={0}
                      className="w-full h-52 object-cover mb-4"
                    />
                  )}
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(Number(reviewData.score) / 2)
                            ? "text-yellow-300"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {reviewData.score}/10
                    </span>
                  </div>
                  <p className="text-gray-700 leading-5">
                    {reviewData.reviewText ||
                      "Your review here (max 300 characters)"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Image Cropper Modal */}
      <Modal isOpen={showCropper} onClose={handleCropCancel} title="Crop Image">
        <ImageCropper
          imageSrc={tempImage}
          onCropComplete={handleCropComplete}
          onCropCancel={handleCropCancel}
        />
      </Modal>
    </div>
  )
}

export default ReviewApp
