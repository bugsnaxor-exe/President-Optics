
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
      <Eye className="h-6 w-6 text-primary" />
      <span>OctaCore</span>
    </Link>
  );
}
