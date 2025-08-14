import Image from "next/image";
import Link from "next/link";

export default function ArtistCard({ artist }) {
  const artistId = artist._id || artist.id;

  return (
    <Link href={`/artist/${artistId}`}>
      <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white">
        <Image
          src={artist.image || "/placeholder.svg"}
          alt={artist.name}
          width={80}
          height={80}
          className="rounded-full object-cover"
        />
        <p className="mt-2 font-semibold text-center">{artist.name}</p>
      </div>
    </Link>
  );
}