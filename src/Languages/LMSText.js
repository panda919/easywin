import en from './en.json';
import fr from './fr.json';
var EN = null;
var FR = null;

export async function warmupLanguages() {
  let EN1 = JSON.stringify(en);
  EN = JSON.parse(EN1);
  let FR1 = JSON.stringify(fr);
  FR = JSON.parse(FR1);
}

export function LMSText(pathToString, translation = __DEV__ ? 'EN' : 'FR') {
  try {
    return eval(`${translation}.${pathToString}`);
  } catch (error) {
    return pathToString;
  }
}
