// A kajian's YouTube video, embedded from the no-cookie domain at 16:9. A live stream's id
// plays live while it runs and as a recording afterwards, so one id serves both.
export default function YouTubePlayer({ videoId, title, className = "" }) {
  return (
    <div className={`relative w-full aspect-video bg-forest border border-forest-line ${className}`}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
