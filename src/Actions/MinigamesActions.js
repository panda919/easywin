import { CLEAR_MINIGAME_RANKING, FETCH_MINIGAMES, FETCH_MINIGAME_RANKING } from './types';
import _ from 'lodash';
import { apiPost, apiGet } from '../Utils/functions';
import { PeriodTabIndexToValue } from '../Constants';

export const fetchMinigamesActions = () => async (dispatch, getState) => {
    let res = await apiGet('/minigames');
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        dispatch({ type: FETCH_MINIGAMES, payload: res.data['hydra:member'] });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};

export const clearRanking = () => (dispatch, getState) => {
    dispatch({ type: CLEAR_MINIGAME_RANKING });
}

export const fetchMinigamesRankingActions = (
    game,
    selectedPeriodTabIndex,
) => async (dispatch, getState) => {

    const data = { period: PeriodTabIndexToValue(selectedPeriodTabIndex), game };
    let res = await apiPost('/users/minigame_rankings', data);

    if (res && res.data && res.data['hydra:member'].length != undefined) {
        dispatch({
            type: FETCH_MINIGAME_RANKING,
            payload: res.data['hydra:member'],
        });
        console.log("minigame_rankings res>>>>>", res.data['hydra:member']);
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};