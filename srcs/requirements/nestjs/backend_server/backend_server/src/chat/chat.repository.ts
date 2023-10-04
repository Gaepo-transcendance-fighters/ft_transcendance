import { HashedChannel } from "src/entity/chat.entity";
import { CustomRepository } from "src/typeorm-ex.decorator";
import { Repository } from "typeorm";

@CustomRepository(HashedChannel)
export class HashedChannelRepository extends Repository<HashedChannel> {    

}