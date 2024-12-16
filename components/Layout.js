import WalletHeader from './WalletHeader';

export default function Layout({ children }) {
  return (
    <div>
      <WalletHeader />
      <main>{children}</main>
    </div>
  );
} 