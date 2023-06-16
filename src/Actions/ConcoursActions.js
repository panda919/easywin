import {
    FETCH_CONCOURS,
    FETCH_CONCOURS_CATEGORIES,
    FETCH_CONCOURS_CITIES,
    FETCH_BANNER_ADS,
} from './types';
import _ from 'lodash';
import { apiGet } from '../Utils/functions';

export const fetchConcoursActions = searchTerm => async (
    dispatch,
    getState,
) => {
    // city.name,category.name,startAt[before],startAt[strictly_before],startAt[after],startAt[strictly_after],endAt[before],endAt[strictly_before],endAt[after],endAt[strictly_after
    // dispatch({ type: FETCH_CONCOURS, payload: [], nextPage: false });
    let res = await apiGet(
        `/competitions?${searchTerm ? searchTerm + '&' : ''
        }page=1&filterEnded=true`,
    );
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let nextPage = false;
        if (
            res.data['hydra:view'] != undefined &&
            res.data['hydra:view']['hydra:next'] != undefined
        ) {
            nextPage = res.data['hydra:view']['hydra:next'];
        }
        // let payload=[].concat(res.data['hydra:member']).concat(res.data['hydra:member']).concat(res.data['hydra:member'])
        dispatch({
            type: FETCH_CONCOURS,
            payload: res.data['hydra:member'],
            nextPage,
        });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchMoreConcoursActions = () => async (dispatch, getState) => {
    let endpoint = getState().concoursReducer.nextPage;

    let res = await apiGet(endpoint);
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let nextPage = false;
        if (
            res.data['hydra:view'] != undefined &&
            res.data['hydra:view']['hydra:next'] != undefined
        ) {
            nextPage = res.data['hydra:view']['hydra:next'];
        }
        dispatch({
            type: FETCH_CONCOURS,
            payload: getState().concoursReducer.concours.concat(
                res.data['hydra:member'],
            ),
            nextPage,
        });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchConcoursCategoriesAction = () => async (
    dispatch,
    getState,
) => {
    let res = await apiGet('/get-used-categories');
    console.log("payload categories", res);

    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let payload = res.data['hydra:member'];
        payload = payload.map(category => {
            return { ...category, label: category.name, value: category.name };
        });
        dispatch({ type: FETCH_CONCOURS_CATEGORIES, payload });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchConcoursCitiesAction = () => async (
    dispatch,
    getState,
) => {
    let res = await apiGet('/get-used-cities');
    console.log("payload cities", res);

    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let payload = res.data['hydra:member'];
        payload = payload.map(city => {
            return { ...city, label: city.name, value: city.name };
        });
        dispatch({ type: FETCH_CONCOURS_CITIES, payload });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchBannerAdsActions = searchTerm => async (
    dispatch,
    getState,
) => {
    let res = await apiGet('/ad_inserts');
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let concourBannerAds = [];
        let scratchBannerAds = [];
        res.data['hydra:member'].forEach(element => {
            if (element.game == 'challenge' && element.medias) {
                concourBannerAds.push(...element.medias);
            }
            if (element.game == 'scratch' && element.medias) {
                scratchBannerAds.push(...element.medias);
            }
        });

        dispatch({ type: FETCH_BANNER_ADS, concourBannerAds, scratchBannerAds });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};
