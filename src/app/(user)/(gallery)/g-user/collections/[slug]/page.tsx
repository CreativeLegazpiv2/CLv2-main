import { notFound } from 'next/navigation';
import { supabase } from '@/services/supabaseClient'; // Adjust the import path as needed
import CollectionDisplay from './CollectionDisplay'; // Adjust the import path to your component

// Define the CollectionProps interface
interface CollectionProps {
  collection: {
    images: {
      image_path: string;
      title: string;
      desc: string;
      artist: string;
      year: string;
    }[];
  };
}

async function getCollection(slug: string) {
  const { data, error } = await supabase
    .from('child_collection')
    .select('*')
    .eq('sluger', slug);

  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }

  if (data && data.length > 0) {
    const collection = data[0];

    // Map the images correctly according to the CollectionProps interface
    const images = data.map(item => ({
      image_path: item.path, // Assuming 'path' is the correct field for the image URL
      title: item.title,     // Adjust these fields according to your actual data structure
      desc: item.desc,
      artist: item.artist,
      year: item.year,
    }));

    return {
      collection: { images }, // Return the collection object as expected in CollectionProps
    };
  }

  return null;
}

export default async function ViewCollectionPage({ params }: { params: { slug: string } }) {
  const collectionData = await getCollection(params.slug);

  if (!collectionData) {
    notFound();
  }

  return <CollectionDisplay collection={collectionData.collection} />;
}
