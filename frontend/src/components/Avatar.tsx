import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: number
}

export default function Avatar({ src, alt, size = 24 }: AvatarProps) {
  if (!src) {
    // Fallback to first letter of name
    const initial = alt.charAt(0).toUpperCase()
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: '#4285f4',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size / 2,
          fontWeight: 'bold',
        }}
      >
        {initial}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
    />
  )
}
