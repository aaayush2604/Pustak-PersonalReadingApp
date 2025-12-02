import { useEffect, useState } from "react";
import axios from "axios";

const useFetchDescription = ({workKey, editionKey}) => {
  const [data, setData] = useState([]); // description
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDescription = async () => {
    if (!workKey && !editionKey) return;

    setIsLoading(true);
    setError(null);

    try {
      let desc = null;

      // 1) Try WORK description
      if (workKey) {
        const workUrl = `https://openlibrary.org/works/${workKey}.json`;

        const workRes = await axios.get(workUrl);
        const work = workRes.data;
        desc=work;
      }

      // 2) Try EDITION description (if work didn't have one)
      if (!desc && editionKey) {
        const editionUrl = `https://openlibrary.org/books/${editionKey}.json`;
        const editionRes = await axios.get(editionUrl);
        const edition = editionRes.data;

        desc=edition;
      }

      setData(desc ?? null);
    } catch (err) {
      setError(err);
      console.error("Error fetching book description:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDescription();
  }, [workKey, editionKey]);

  const refetch = () => {
    setIsLoading(true);
    fetchDescription();
  };

  return { data, isLoading, error, refetch };
};

export default useFetchDescription;
