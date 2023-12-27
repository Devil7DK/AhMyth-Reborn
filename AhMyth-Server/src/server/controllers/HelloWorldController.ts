import { Controller, Get } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@Controller('/hello-world')
export class HelloWorldController {
    @Get('/')
    public getHelloWorld(): string {
        return 'Hello World!';
    }
}
