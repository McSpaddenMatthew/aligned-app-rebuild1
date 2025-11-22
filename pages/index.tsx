import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};

export default function Home() {
  // This component never actually renders because of the redirect,
  // but Next.js requires a default export.
  return null;
}
