import { CLEAR_AFFILIATES, FETCH_AFFILIATES } from './types';
import _ from 'lodash';
import { apiPost } from '../Utils/functions';
import { PeriodTabIndexToValue } from '../Constants';


export const clearAffiliatesActions = () => async (dispatch, getState) => {
    dispatch({ type: CLEAR_AFFILIATES });
}

export const fetchAffiliatesActions = selectedPeriodTabIndex => async (
    dispatch,
    getState,
) => {
    const data = { period: PeriodTabIndexToValue(selectedPeriodTabIndex) };
    let res = await apiPost('/users/rankings', data);
    console.log("Affiliates res>>>>", res)
    if (res && res.data && res.data['hydra:member'].length != undefined) {
        dispatch({ type: FETCH_AFFILIATES, payload: res.data['hydra:member'] });
        return true;
    } else if (res && res.error) {
        return false;
    } else {
        return false;
    }
};
