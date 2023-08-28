import { Logger } from '@nestjs/common';
import exp from 'constants';

export class ReturnMsgDto {
  code: number;
  msg: string;
}

export class LoggerWithRes {
  private code: number;
  private msg: string;
  private pos: string;
  private logger: Logger;

  /**
   *
   * @param targetKeyword Controller or Gateway keyword
   */
  constructor(targetKeyword: string) {
    this.code = 0;
    this.msg = '';
    this.logger = new Logger(targetKeyword);
  }

  public setPos(pos: string) {
    this.logger = new Logger(pos);
    this.logger.log(`pos keyword is changed to '${this.pos}'`);
  }

  /**
   * 성공 return값을 전달하면서 response 를 로깅해줍니다.
   * @param code 반환 코드
   * @param msg 반환 코드에 대한 세부 메시지
   * @param apiName 로깅하는 위치의 특정 api
   * @returns
   */
  public setResponseMsgWithLogger(
    code: number,
    msg: string,
    apiName: string,
  ): ReturnMsgDto {
    this.code = code;
    this.msg = msg;
    this.logger.log(`Response : ${apiName} = ${code} - ${msg}`);
    return { code: this.code, msg: this.msg };
  }

  /**
   * 실패 return값을 전달하면서 response 를 로깅해줍니다.
   * @param code 반환 코드
   * @param msg 반환 코드에 대한 세부 메시지
   * @param apiName 로깅하는 위치의 특정 api
   * @returns
   */
  public setResponseErrorMsgWithLogger(
    code: number,
    msg: string,
    apiName: string,
    key?: string | number,
  ): ReturnMsgDto {
    this.code = code;
    this.msg = msg;
    this.logger.error(`Response : ${apiName} = ${code} - ${key} ${msg}`);
    return { code: this.code, msg: this.msg };
  }

  /**
   * return 값을 전달하며, 로깅은 하지 않습니다.
   * @param code 반환 코드
   * @param msg 반환 코드에 대한 세부 메시지
   * @returns
   */
  public setResponseMsg(code: number, msg: string): ReturnMsgDto {
    this.code = code;
    this.msg = msg;
    return { code: this.code, msg: this.msg };
  }

  /**
   * logger의 wrapping class, 애플리케이션의 정상 동작 상황을 나타내는 로그에 사용됩니다. 주로 사용자의 행동, 요청 처리 또는 중요한 이벤트에 대한 정보를 기록하는데 사용합니다.
   * @param functName 함수명을 지정합니다.
   * @param key 특정 변수를 지정할 때 사용합니다.
   * @param value 특정 변수의 값을 지정할 때 사용합니다. key와 value를 적지 않고 '' 로 적으면, explain 만을 출력해줍니다.
   * @param explain 설명등의 내용을 작성하나, 필수는 아닙니다.
   */
  public logWithMessage(
    functName: string,
    key: string,
    value: string,
    explain?: string,
  ) {
    if (explain === undefined)
      this.logger.log(`[ ${functName} ] ${key} = ${value}`);
    else if (key.length == 0 && value.length == 0) {
      this.logger.log(`[ ${functName} ] ${explain}`);
    } else {
      this.logger.log(`[ ${functName} ] ${key} = ${value} : ${explain}`);
    }
  }

  /**
   * logger의 wrapping class, 경고 메시지에 사용됩니다. 예상치 못한 상황이나 잠재적인 문제를 나타내며, 애플리케이션은 계속 작동하지만 주의해야 할 상황임을 알려줍니다.
   * @param functName 함수명을 지정합니다.
   * @param key 특정 변수를 지정할 때 사용합니다.
   * @param value 특정 변수의 값을 지정할 때 사용합니다. key와 value를 적지 않고 '' 로 적으면, explain 만을 출력해줍니다.
   * @param explain 설명등의 내용을 작성하나, 필수는 아닙니다.
   */
  public logWithWarn(
    functName: string,
    key: string,
    value: string,
    explain?: string,
  ) {
    if (explain === undefined)
      this.logger.warn(`[ ${functName} ] ${key} = ${value}`);
    else if (key.length == 0 && value.length == 0) {
      this.logger.warn(`[ ${functName} ] ${explain}`);
    } else {
      this.logger.warn(`[ ${functName} ] ${key} = ${value} : ${explain}`);
    }
  }

  /**
   * logger의 wrapping class, 오류 메시지에 사용됩니다. 장애 상황이나 처리할 수 없는 문제가 발생한 경우 사용되며, 애플리케이션이 예상대로 작동하지 않는 상황임을 나타냅니다.
   * @param functName 함수명을 지정합니다.
   * @param key 특정 변수를 지정할 때 사용합니다.
   * @param value 특정 변수의 값을 지정할 때 사용합니다. key와 value를 적지 않고 '' 로 적으면, explain 만을 출력해줍니다.
   * @param explain 설명등의 내용을 작성하나, 필수는 아닙니다.
   */
  public logWithError(
    functName: string,
    key: string,
    value: string,
    explain?: string,
  ) {
    if (explain === undefined)
      this.logger.error(`[ ${functName} ] ${key} = ${value}`);
    else if (key.length == 0 && value.length == 0) {
      this.logger.error(`[ ${functName} ] ${explain}`);
    } else {
      this.logger.error(`[ ${functName} ] ${key} = ${value} : ${explain}`);
    }
  }

  /**
   * logger의 wrapping class, 디버깅 목적으로 사용됩니다. 개발 중에만 유용하며, 애플리케이션 내부의 상세 정보와 변수 값을 출력해 문제 해결에 도움을 줍니다.
   * @param functName 함수명을 지정합니다.
   * @param key 특정 변수를 지정할 때 사용합니다.
   * @param value 특정 변수의 값을 지정할 때 사용합니다. key와 value를 적지 않고 '' 로 적으면, explain 만을 출력해줍니다.
   * @param explain 설명등의 내용을 작성하나, 필수는 아닙니다.
   */
  public logWithDebug(
    functName: string,
    key: string,
    value: string,
    explain?: string,
  ) {
    if (explain === undefined)
      this.logger.debug(`[ ${functName} ] ${key} = ${value}`);
    else if (key.length == 0 && value.length == 0) {
      this.logger.debug(`[ ${functName} ] ${explain}`);
    } else {
      this.logger.debug(`[ ${functName} ] ${key} = ${value} : ${explain}`);
    }
  }

  /**
   * logger의 wrapping class, 더 자세한 디버깅 정보를 제공하기 위해 사용됩니다. 일반적으로 debug보다 더 상세한 정보를 출력하며, 상세한 내부 동작을 추적하는 데 사용됩니다.
   * @param functName 함수명을 지정합니다.
   * @param key 특정 변수를 지정할 때 사용합니다.
   * @param value 특정 변수의 값을 지정할 때 사용합니다. key와 value를 적지 않고 '' 로 적으면, explain 만을 출력해줍니다.
   * @param explain 설명등의 내용을 작성하나, 필수는 아닙니다.
   */
  public logWithVerbose(
    functName: string,
    key: string,
    value: string,
    explain?: string,
  ) {
    if (explain === undefined)
      this.logger.verbose(`[ ${functName} ] ${key} = ${value}`);
    else if (key.length == 0 && value.length == 0) {
      this.logger.verbose(`[ ${functName} ] ${explain}`);
    } else {
      this.logger.verbose(`[ ${functName} ] ${key} = ${value} : ${explain}`);
    }
  }
}
