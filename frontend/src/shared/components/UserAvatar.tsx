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

  return (
    <div className={`user-avatar user-avatar-${size} ${className}`}>
      {user.profilePhotoUrl ? (
        <img
          src={user.profilePhotoUrl}
          alt={user.name}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default UserAvatar;