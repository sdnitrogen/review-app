import React, { useState, useRef } from "react"
import ReactCrop, { Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageUrl: string) => void
  onCropCancel: () => void
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCropCancel,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const imageRef = useRef<HTMLImageElement>(null)
  const [isCropped, setIsCropped] = useState(false)

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas")
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = Math.ceil(crop.width * scaleX)
    canvas.height = Math.ceil(crop.height * scaleX)
    const ctx = canvas.getContext("2d")

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      )
    }

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty")
          return
        }
        const croppedImageUrl = URL.createObjectURL(blob)
        resolve(croppedImageUrl)
      }, "image/jpeg")
    })
  }

  const handleCropComplete = async () => {
    if (imageRef.current && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(imageRef.current, crop)
      onCropComplete(croppedImageUrl)
      setIsCropped(true)
    }
  }

  const handleCancel = () => {
    if (!isCropped) {
      onCropCancel()
    }
  }

  return (
    <div>
      <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={16 / 8}>
        <Image
          ref={imageRef}
          src={imageSrc}
          width={0}
          height={0}
          style={{ width: "100%", height: "auto" }}
          alt="Crop me"
        />
      </ReactCrop>
      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={handleCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleCropComplete}>Complete Crop</Button>
      </div>
    </div>
  )
}

export default ImageCropper
