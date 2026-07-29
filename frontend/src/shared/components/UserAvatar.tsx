import { useEffect, useState } from 'react';
import type { User } from '../types';

interface Props {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(' ')
    .filter(Boolean);

  if (words.length === 0) {
    return 'U';
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function UserAvatar({ user, size = 'md', className = '' }: Props) {
  const initials = getInitials(user.name);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [user.profilePhotoUrl]);

  const showPhoto = Boolean(user.profilePhotoUrl) && !imageFailed;

  return (
    <div className={`user-avatar user-avatar-${size} ${className}`}>
      {showPhoto ? (
        <img
          src={user.profilePhotoUrl ?? undefined}
          alt={user.name}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default UserAvatar;
