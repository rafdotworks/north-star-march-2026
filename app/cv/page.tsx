import { redirect } from 'next/navigation';

export default function CVPage() {
  redirect('/documents/CV.pdf');
}
