import { FETCH_EARNINGS, FETCH_USER_EARNINGS } from './types';
import _ from 'lodash';
import { apiGet } from '../Utils/functions';

export const fetchEarningsActions = tabIndex => async (dispatch, getState) => {
    let endpoint = '/competition_earnings?order[id]=desc&';
    switch (tabIndex) {
        case 0:
            endpoint = endpoint + 'exists[lot.competition]=true';
            break;
        case 1:
            endpoint = endpoint + 'exists[lot.scratch]=true';
            break;
        case 2:
            endpoint = endpoint + 'exists[lot.minigame]=true';
            break;

        default:
            break;
    }
    let res = await apiGet(endpoint);
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        dispatch({ type: FETCH_EARNINGS, payload: res.data['hydra:member'] });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchUsersEarningsActions = () => async (dispatch, getState) => {
    let endpoint = `/competition_earnings?user=${getState().userReducer.userProfile.id
        }&order[id]=desc`;

    let res = await apiGet(endpoint);

    if (res && res.data && res.data['hydra:member'].length != undefined) {
        let nextPage = false;
        if (
            res.data['hydra:view'] != undefined &&
            res.data['hydra:view']['hydra:next'] != undefined
        ) {
            console.log("res.data['hydra:member']....", res.data['hydra:view']['hydra:next']);
            nextPage = res.data['hydra:view']['hydra:next'];
        }
        dispatch({ type: FETCH_USER_EARNINGS, payload: res.data['hydra:member'], nextPage });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const fetchMoreUsersEarningsActions = () => async (dispatch, getState) => {
    let endpoint = getState().earningsReducer.nextPage;

    let res = await apiGet(`${endpoint}&order[id]=desc`);
    if (res && res.data && res.data['hydra:member'].length != undefined && res.data['hydra:member'].length > 0) {
        let nextPage = false;

        if (
            res.data['hydra:view'] != undefined &&
            res.data['hydra:view']['hydra:next'] != undefined
        ) {
            console.log("next res.data['hydra:member']....", res.data['hydra:view']['hydra:next']);
            if (endpoint == res.data['hydra:view']['hydra:next']) {
                nextPage = false
            }
            else {
                nextPage = res.data['hydra:view']['hydra:next'];
            }

        }

        dispatch({
            type: FETCH_USER_EARNINGS,
            payload: [...getState().earningsReducer.myEarnings, ...res.data['hydra:member']],
            nextPage,
        });

        return true;

    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};