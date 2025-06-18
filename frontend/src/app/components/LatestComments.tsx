import Link from 'next/link';

type Comment = {
  id: number;
  content: string;
  player_name: string;
  player_id: number;
  user: {
    id: number;
    username: string;
  };
  likes_count: number;
  created_at: string;
};

type LatestCommentsProps = {
  comments: Comment[];
  title?: string;
  description?: string;
};

export default function LatestComments({ 
  comments, 
  title = "Najnowsze komentarze", 
  description = "Ostatnie opinie kibiców o piłkarzach" 
}: LatestCommentsProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day}, ${time}`;
  };

  return (
    <div className="card">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">{title}</h2>
        <p className="text-sm text-text-light/80">{description}</p>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-white/10 pb-3 last:border-0 hover:bg-primary-bg/30 transition-colors rounded-md p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-teal-400 text-base tracking-wide">
                  {comment.user.username}
                </div>
                <span className="text-xs text-text-light/60">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-text-light/90 mb-2">{comment.content}</p>              <div className="flex justify-between items-center text-xs text-text-light/70">
                <Link 
                  href={`/players/${comment.player_id}`}
                  className="text-accent-color hover:underline"
                >
                  {comment.player_name}
                </Link>
                <div className="flex items-center gap-1">
                  <span>❤️</span>
                  <span>{comment.likes_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-text-light/50">
          <p>Brak komentarzy</p>
        </div>
      )}
      
      <div className="text-center mt-4">
        <Link 
          href="/players" 
          className="text-accent-color text-sm hover:underline"
        >
          Przeglądaj wszystkich piłkarzy
        </Link>
      </div>
    </div>
  );
}
