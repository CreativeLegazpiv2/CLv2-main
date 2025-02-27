
import GalleryTitle from "./g-visitor-components/GalleryTitle";
import { FeaturedCollections } from "../../(user)/gallery-display/g-user-components/FeaturedGallery";
import { CreativeDirectory } from "../home/landing-page/CreativeDirectory";
// import IndividualWorks from "./g-visitor-components/IndividualWorks";
// import StatisticsBanner from "./g-visitor-components/StatisticsBanner";
// import BrowseGallery from "./g-visitor-components/BrowseGallery";
// import GalleryTitle from "./g-visitor-components/GalleryTitle";



export default function GalleryVisitorPage() {
    return (
        <main className="w-full h-fit text-primary-2 overflow-x-hidden bg-palette-5"> {/* Ensure no horizontal scrolling */}
            <div className="pt-[10dvh] flex flex-col w-full max-w-full"> {/* Ensure full width with no overflow */}
                {/* <GalleryTitle />
                <BrowseGallery />
                <StatisticsBanner />
                <IndividualWorks />
              */}

                <GalleryTitle />
                {/* <CreativeDirectory /> */}
                <FeaturedCollections />


            </div>
        </main>
    )
}
