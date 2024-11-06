export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full w-full mt-14">{children}</div>;
}
