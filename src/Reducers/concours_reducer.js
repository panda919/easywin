import { FETCH_BANNER_ADS, FETCH_CONCOURS, FETCH_CONCOURS_CATEGORIES, FETCH_CONCOURS_CITIES } from "../Actions/types";

const INITIAL_STATE = {
    concours: [],
    categories: [],
    cities: [],
    nextPage: false,
    concourBannerAds: [],
    scratchBannerAds: [],
};

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case FETCH_CONCOURS: {
            let concoursfilter = action.payload.filter(obj => new Date(obj.startAt) <= new Date())
            return { ...state, concours: concoursfilter, nextPage: action.nextPage };
        }
        case FETCH_CONCOURS_CATEGORIES: {
            return { ...state, categories: action.payload };
        }
        case FETCH_CONCOURS_CITIES: {
            return { ...state, cities: action.payload };
        }
        case FETCH_BANNER_ADS: {
            return {
                ...state,
                concourBannerAds: action.concourBannerAds,
                scratchBannerAds: action.scratchBannerAds,
            };
        }
        default:
            return state;
    }
}
