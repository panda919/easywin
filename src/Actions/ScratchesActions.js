import { FETCH_SCRATCHES } from './types';
import _ from 'lodash';
import { apiGet } from '../Utils/functions';

export const fetchScratchesActions = searchTerm => async (
  dispatch,
  getState,
) => {
  let res = await apiGet(
    `/scratches?${searchTerm ? searchTerm + '&' : ''}page=1&filterEnded=true`,
  );
  
  if (res && res?.data && res?.data['hydra:member'].length != undefined) {
    let nextPage = false;
    if (
      res?.data['hydra:view'] != undefined &&
      res?.data['hydra:view']['hydra:next'] != undefined
    ) {
      nextPage = res?.data['hydra:view']['hydra:next'];
    }
    dispatch({
      type: FETCH_SCRATCHES,
      payload: res?.data['hydra:member'],
      nextPage,
    });
    console.log("fetchScratchesActions....",res.data['hydra:member'])

    return true;
  } else if (res && res.error) {
    return false;
  } else {
    return false;
  }
};

export const fetchMoreScratchesActions = () => async (dispatch, getState) => {
  let endpoint = getState().scratchesReducer.nextPage;

  let res = await apiGet(endpoint);
  
  if (res && res?.data && res?.data['hydra:member'].length != undefined) {
    let nextPage = false;
    if (
      res?.data['hydra:view'] != undefined &&
      res?.data['hydra:view']['hydra:next'] != undefined
    ) {
      nextPage = res?.data['hydra:view']['hydra:next'];
    }
    dispatch({
      type: FETCH_SCRATCHES,
      payload: getState().scratchesReducer.scratches.concat(
        res.data['hydra:member'],
      ),
      nextPage,
    });
    console.log("fetchMoreScratchesActions response....",res.data['hydra:member'])
  
    return true;
  } else if (res && res?.error) {
    return false;
  } else {
    return false;
  }
};
