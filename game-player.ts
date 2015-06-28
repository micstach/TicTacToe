export class Player {
    name: string ;
    guid: string ;
    
    constructor (_guid: string, _name: string) {
        this.guid = _guid ;
        this.name = _name ;
    }
    
    acceptChallenge() {
    }
    
    update(json) {
        this.name = json.name ;
        this.guid = json.guid ;
    }
}
