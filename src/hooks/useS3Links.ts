import { useState, useEffect } from 'react';

export interface S3LinksData {
  [key: string]: string;
}

const S3_URL = 'https://adamprobalkozik.s3.eu-central-1.amazonaws.com/asd/KLd69ClyilacvJ.json';

export const useS3Links = () => {
  const [linksData, setLinksData] = useState<S3LinksData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLinksData = async () => {

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(S3_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();
      setLinksData(data);
    } catch (err) {
      console.error('Failed to load S3 links:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch S3 data');
      setLinksData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinksData();
  }, []);

  return {
    linksData,
    isLoading,
    error,
    refetch: fetchLinksData
  };
};
