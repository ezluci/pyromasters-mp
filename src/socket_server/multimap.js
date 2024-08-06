class MultiMap{ // https://stackoverflow.com/a/74594400
    map = new Map;
    own = Symbol();// unique value that doesn't collide
    set(){
        let lst = [...arguments];
        let val = lst.pop();
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))map.set(k,new Map);
            map = map.get(k);
        }
        map.set(this.own,val);// to avoid collision between the same level
        return val;
    }
    get(...lst){
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return undefined;
            map = map.get(k);
        }
        return map.get(this.own);
    }
    has(...lst){
        let map = this.map;
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
        }
        return map.has(this.own);
    }
    delete(...lst){
        let map = this.map;
        let maps = [[null,map]];
        for(let k of lst){
            if(!map.has(k))return false;
            map = map.get(k);
            maps.push([k,map]);
        }
        let ret = map.delete(this.own);
        for(let i = maps.length-1; i > 0; i--){
            if(maps[i][1].size === 0){
                maps[i-1][1].delete(maps[i][0]);
            }else{
                break;
            }
        }
        return ret;
    }
}

module.exports = MultiMap;