import { useQuery } from "@tanstack/react-query"

export function useAllIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const response = await fetch('https://api.motherduck.com/v1/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_MOTHERDUCK_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          database: process.env.NEXT_PUBLIC_MOTHERDUCK_DATABASE,
          query: `
            WITH filtered_data AS (
              SELECT 
                Location,
                Date,
                IUCR,
                "Primary Type" AS primary_type,
                Arrest,
                "Community Area" AS community_area,
                CAST(Latitude AS FLOAT) as latitude,
                CAST(Longitude AS FLOAT) as longitude
              FROM cleaned_chicago_crime_data
              WHERE Date BETWEEN TIMESTAMP '2018-01-01' AND TIMESTAMP '2024-12-31'
                AND Latitude IS NOT NULL 
                AND Longitude IS NOT NULL
              LIMIT 10000
            )
            SELECT 
              latitude,
              longitude,
              1.0 as intensity
            FROM filtered_data
            WHERE latitude BETWEEN 41.6 AND 42.1
              AND longitude BETWEEN -87.9 AND -87.5
          `
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      // Transform the data into the format expected by Leaflet.heat
      return (data.rows || []).map((row: { latitude: string; longitude: string; intensity: string }) => [
        Number(row.latitude),
        Number(row.longitude),
        Number(row.intensity)
      ]);
    },
    staleTime: 1000 * 60 * 5,
    retry: 3
  })
}