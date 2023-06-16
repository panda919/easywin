import { FETCH_CITIES } from './types';
import _ from 'lodash';
import { apiGet } from '../Utils/functions';

export const fetchCitiesActions = searchTerm => async (dispatch, getState) => {
  dispatch({ type: FETCH_CITIES, payload: [], nextPage: false });
  let res = await apiGet(
    `/cities?${searchTerm ? 'name=' + searchTerm + '&' : ''}page=1`,
  );
  if (res && res.data && res.data['hydra:member'].length != undefined) {
    let nextPage = false;
    if (
      res.data['hydra:view'] != undefined &&
      res.data['hydra:view']['hydra:next'] != undefined
    ) {
      nextPage = res.data['hydra:view']['hydra:next'];
    }
    dispatch({
      type: FETCH_CITIES,
      payload: res.data['hydra:member'],
      nextPage,
    });
    return true;
  } else if (res && res.error) {
    return false;
  } else {
    dispatch({ type: FETCH_CITIES, payload: [], nextPage: false });
    return false;
  }
};

export const fetchMoreCitiesActions = () => async (dispatch, getState) => {
  let endpoint = getState().citiesReducer.nextPage;

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
      type: FETCH_CITIES,
      payload: getState().citiesReducer.cities.concat(res.data['hydra:member']),
      nextPage,
    });
    return true;
  } else if (res && res.error) {
    return false;
  } else {
    return false;
  }
};
