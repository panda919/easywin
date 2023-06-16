import React, { useEffect } from 'react';
import { Text } from 'react-native';
import useBackgroundTimer from './useBackgroundTimer';

const CountDown = ({ endTime, startTime, style }) => {
  const { time: showTime, startTimer, stopTimer } = useBackgroundTimer(endTime);

  useEffect(() => {
    startTimer();
    return () => {
      stopTimer();
    };
  }, []);

  let days = parseInt(showTime / 86400, 10);
  const hourTime = showTime % 86400;
  let hours = parseInt(hourTime / 3600, 10);
  const miniteTime = hourTime % 3600;
  let minutes = parseInt(miniteTime / 60, 10);
  let seconds = parseInt(miniteTime % 60, 10);

  return (
    <>
      <Text
        style={{
          color: '#021C46',
          fontSize: 18,
          fontWeight: '400',
          ...style,
        }}>{`${days} : ${hours < 10 ? '0' + hours : hours} : ${minutes < 10 ? '0' + minutes : minutes
          } : ${seconds < 10 ? '0' + seconds : seconds}`}</Text>
    </>
  );
}
export default CountDown;
