import * as file from "fs/promises"

file.readFile("static/test", "utf-8").
    then(x =>
        console.log(x)).
    catch(e => 
        console.log(e))
        