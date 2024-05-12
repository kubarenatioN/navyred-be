import { Controller, Get, Query, Req } from '@nestjs/common';
import { rand } from 'apps/game/src/helpers/crypto';
import { Request } from 'express';
import { sign } from 'jsonwebtoken';
import { Web3AuthService } from '../service';

@Controller({
  path: 'auth/web3',
  version: '1',
})
export class Web3AuthController {
  constructor(private authService: Web3AuthService) {}

  @Get('nonce')
  requestNonce(@Query('address') address: string) {
    const nonce = rand();
    const message = this.getSignMessage(nonce);

    const token = sign(
      {
        address,
        nonce,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '60s',
      },
    );

    return {
      token,
      message,
    };
  }

  @Get('login')
  async verifySignature(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('signature') signature: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() req: Request,
  ) {
    // const { authorization } = req.headers;
    // if (!authorization) {
    //   throw new HttpException('No auth header', HttpStatus.FORBIDDEN);
    // }

    // let address = '';
    // let nonce = '';
    // try {
    //   const data = verify(
    //     authorization,
    //     process.env.ACCESS_TOKEN_SECRET,
    //   ) as JwtPayload;

    //   address = data.address;
    //   nonce = data.nonce;
    // } catch (error) {
    //   throw new HttpException('Auth token expired', HttpStatus.UNAUTHORIZED);
    // }

    // const message = this.getSignMessage(nonce);

    // const verifiedAddress = web3.eth.accounts.recover(message, signature);

    // const isEqual = verifiedAddress.toLowerCase() === address.toLowerCase();

    // if (!isEqual) {
    //   throw new HttpException('Bad signature', HttpStatus.BAD_REQUEST);
    // }

    const address = '0xeca102a0E8755cAC155cE219B7051db53D012dF2';

    const { accessToken } = await this.authService.login(address);

    return {
      accessToken,
    };
  }

  private getSignMessage(nonce: string): string {
    return `Please sign the message to proceed\n\n${nonce}`;
  }
}
