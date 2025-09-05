import { NextPage } from "next";

const HomePage: NextPage = () => {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Automatic Cloud Upload</h1>
      <p>
        Uploads JSONPlaceholder data to Google Cloud Storage every X minutes.
      </p>
    </main>
  );
};

export default HomePage;
