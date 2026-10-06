export default function BrandLogo({ className = '' }: { className?: string }) {
  return <img src="/imagem/logo.png" alt="Qualifica Vix" width={2400} height={1340}
    className={`brand-logo ${className}`} />;
}
