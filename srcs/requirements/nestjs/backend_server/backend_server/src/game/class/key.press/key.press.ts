import { Fps } from 'src/game/enum/frame.data.enum';

/**
 * 키 입력을 받는 클래스. 자체적으로 동작하고, 최종적으로 호출시 키 입력 수준을 결정한다.
 */
export class KeyPress {
  private keyAccumulatedValue: number;
  private maxFrame: number;
  private pressedNumber: Fps;
  private moveTotalUnit: number;
  private moveUnit: number;

  /**
   *
   * @param latency 최대 프레임을 나타내며, 레이턴시를 고려하여, 프레임을 할당하면 된다. 7 ms 이하인 경우 60 fps, 14ms 이하인 경우 30 fps, 20ms 이하인 경우 24fps로 동작한다. 100ms 이하인 경우에는 특별 케이스로 보간 기법을 활용하면 되어서 구현해본다.
   */
  constructor() {
    this.maxFrame = -1;
    this.pressedNumber = 0;
    this.moveUnit = 1;
    this.keyAccumulatedValue = 0;
  }

  public setRenewKeypress() {
    this.maxFrame = -1;
    this.pressedNumber = 0;
    this.moveUnit = 1;
    this.keyAccumulatedValue = 0;
  }

  public setPressedNumberByMaxFps(maxFps: number) {
    if (maxFps == 60) {
      this.pressedNumber = Fps.FULL;
    } else if (maxFps == 30) {
      this.pressedNumber = Fps.HALF;
    } else if (maxFps == 24) {
      this.pressedNumber = Fps.LOW;
    } else if (maxFps == 10) {
      this.pressedNumber = Fps.SUPERLOW;
    } else {
      this.pressedNumber = 0;
    }
    this.pressedNumber *= 15;
  }

  public setMaxUnit(value: number) {
    this.moveTotalUnit = value;
    this.moveUnit = Math.ceil(this.moveTotalUnit / 20);
  }

  public pushKey(value: number) {
    const howManyPushKey = this.pressedNumber.valueOf();
    this.keyAccumulatedValue += value * howManyPushKey;
  }

  public popKeyValue(): number {
    const thresholdLevel = 6;
    const sum = Math.floor(this.keyAccumulatedValue / thresholdLevel);
    this.keyAccumulatedValue -= sum * thresholdLevel;
    return sum * this.moveUnit;
  }

  public getHowManyKey(): number {
    return this.keyAccumulatedValue;
  }
}
