import Image from "next/image"

export default function Kewl() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-primary text-white gap-5">
      <p>
        I really love music, books (send fantasy recs my way), and art in general!
        <br></br>
        I used to do digital art for years, but ever since this year, I picked up an interest in painting.
        I love nature, and it sneaks into my artwork quite often haha.
        <br></br>
        Here are two of my more recent works! I also embedded one of my most listened to spotify playlists last semester.
        <br></br>
        I think it has a good mix of all my favorite genres, though it could use a bit more j-pop heh
        <br></br>
        alsoo fun fact I used to be in a girl band (we only covered songs) in high school !!
      </p>

      <div>
        <Image width="240"
          height="180"
          alt="Painting of lilypads in a lake"
          src="/lake_lilypads.jpg">
        </Image>
        <Image width="200"
          height="300"
          alt="Digital art of a fish"
          src="/fish.png">
        </Image>
      </div>

      <iframe
        src="https://open.spotify.com/embed/playlist/6ax3GcDyAjtVc3CNypFx7c?utm_source=generator"
        width="50%"
        height="352"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
      </iframe>
    </div>
  );
}
