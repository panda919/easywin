import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState } from 'react-native';
import { getCurrentServerTime } from '../Actions';
import moment from 'moment';
import selfCorrectingInterval from './selfCorrectingInterval';

const useBackgroundTimer = (endTime, delta = 0, wallet = null, level = null) => {
  const durationTimer = useRef(null);
  const [time, setTime] = useState(0);

  const isTimerRunning = durationTimer.current != null;
  const hasTimerEnded = time <= 0 && isTimerRunning;

  const appState = useRef(AppState.currentState);

  const { scratchMaxLimit, challengeMaxLimit } = useMemo(() => {
    if (level == 3) {
      return { scratchMaxLimit: 5, challengeMaxLimit: 17 };
    } else if (level > 3) {
      return { scratchMaxLimit: 6, challengeMaxLimit: 19 };
    }
    return { scratchMaxLimit: 4, challengeMaxLimit: 15 };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (wallet == null) {
          startTimer();
        }
        else {

          if (wallet?.challengeTime && wallet?.challengeCredit < challengeMaxLimit) {

            startTimer();
          }

          if (wallet?.scratchTime && wallet?.scratchCredit < scratchMaxLimit) {

            startTimer();
          }
        }


      } else {
        stopTimer(true);
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };

  }, []);

  const update = () => {
    if (durationTimer.current) {
      setTime(prevTime => prevTime - 1);
    }
  };
  useEffect(() => {
    if (time <= 0 && durationTimer.current) {
      stopTimer(true);
    }
    return () => { };
  }, [time]);

  const startTimer = async () => {
    const curentServerMoment = await getCurrentServerTime();

    const nowMoment = moment(curentServerMoment);
    const endMoment = moment(endTime).add(delta, 'minutes');
    if (!endMoment.isSameOrBefore(nowMoment)) {
      setTime((endMoment - nowMoment) / 1000);
      durationTimer.current = selfCorrectingInterval.setInterval(update, 1000);
    }
  };
  const stopTimer = initTimer => {
    selfCorrectingInterval.clearInterval(durationTimer.current);
    durationTimer.current = null;
    if (initTimer) {
      setTime(0);
    }
  };

  useEffect(
    () => () => {
      stopTimer();
    },
    [],
  );
  return {
    time,
    hasTimerEnded,
    isTimerRunning,
    startTimer,
    stopTimer,
  };
};
export default useBackgroundTimer;
