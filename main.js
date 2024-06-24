let SHEET_ID = '1t48ydjUAeyQk3hBIhKpBjOGFngxqs9r5ndLqNaGYGmE'
let SHEET_TITLE = 'f2l';
let SHEET_RANGE = ''
let FULL_URL = ('https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE + '&range=' + SHEET_RANGE);

const mainDiv = document.querySelector("#main-grid");

const stickerKeys = [
    'U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9',
    'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9',
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9',
    'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9'
];
const angles = ["FR", "FL", "BL", "BR"]

let corners = [
    [8, 9, 20], [6, 18, 38], [15, 26, 29], [24, 27, 44],
    [2, 11, 45], [0, 36, 47], [35, 17, 51], [42, 33, 53]
];
    
let edges = [
    [3, 37], [5, 10], [1, 46], [7, 19],
    [21, 41], [23, 12], [39, 50], [14, 48],
    [43, 30], [16, 32], [52, 34], [25, 28]
];

async function fetchData() {
    const res = await fetch(FULL_URL).then(res => res.text());
    return JSON.parse(res.substring(47).slice(0,-2));
}


function pieceIndex(givenPiece, cubestring) {
    const pieces = givenPiece.length === 3 ? corners : edges;
    
    for (let piece of pieces) {
        let thisPiece = piece.map(index => cubestring[index]);
        if (thisPiece.every(item => givenPiece.includes(item))) {
            console.log()
            return givenPiece.map(color => piece[thisPiece.indexOf(color)]);
        }
    }
}

function isSolved(givenPiece, givenCube) {
    const cube = new Cube(givenCube).move(rotateCube("U", "F", givenCube))

    const index = pieceIndex(givenPiece, cube.asString())
    const solvedCube = new Cube()
    return index.every(index => solvedCube.asString()[index]===givenCube.asString()[index])
}

function rotateCube(upColor, frontColor, givenCube) {
    let moves = "";

    if      (new Cube(givenCube).move("z").asString()[4] === upColor) {moves += "z"}
    else if (new Cube(givenCube).move("z2").asString()[4] === upColor) {moves += "z2"}
    else if (new Cube(givenCube).move("z'").asString()[4] === upColor) {moves += "z'"}
    else if (new Cube(givenCube).move("x").asString()[4] === upColor) {moves += "x"}
    else if (new Cube(givenCube).move("x'").asString()[4] === upColor) {moves += "x'"}

    if      (new Cube(givenCube).move(moves + " y").asString()[22] === frontColor) {moves += " y"}
    else if (new Cube(givenCube).move(moves + " y2").asString()[22] === frontColor) {moves += " y2"}
    else if (new Cube(givenCube).move(moves + " y'").asString()[22] === frontColor) {moves += " y'"}

    return normalize(moves)
}

async function main() {
    let data = await fetchData()

    data.table.rows.forEach(row => {
        //create container
        const newCase = document.createElement("div");
        mainDiv.appendChild(newCase);

        //main case
        const mainAlg = window.normalize(row.c[0].v.split("\n")[0]);

        //insert img into container
        const newImg = document.createElement('div');
        puzzleGen.PNG(newImg, puzzleGen.Type.CUBE, { 
            puzzle: {
                    case: mainAlg + rotateCube("U", "F", new Cube().move(mainAlg)), 
                    mask: puzzleGen.Masks.CUBE_3.F2L,
                    rotations: [{ y: 60 }, { x: 30 }]
                }
            }
        );
        newCase.appendChild(newImg);

        //insert alg container into div
        const algDiv = document.createElement('div');
        newCase.append(algDiv)
        
        for (const [index, entry] of row.c.slice(0,4).entries()){
            if ( !entry || !entry.v ) continue;

            const value = entry.v;
            const algs = value.split("\n");

            const infoDiv = document.createElement("div");
            infoDiv.innerHTML = angles[index];
            algDiv.appendChild(infoDiv);

            const angleAlgsDiv = document.createElement("div");
            algDiv.appendChild(angleAlgsDiv);

            algs.forEach(rawalg => {
                const alg = normalize(rawalg)
                const algInverse = normalize(alg, {invert: true});

                let algCube = new Cube();
                algCube.move(window.normalize(mainAlg, {invert: true}))
                algCube.move(normalize("y'".repeat(index) + alg + "y".repeat(index)))
                algCube.move(rotateCube("U", "F", algCube))

                const newAlg = document.createElement("div");
                newAlg.innerHTML = alg;
                if (!(isSolved(["D","F", "R"], algCube) && isSolved(["F", "R"], algCube))) {
                    newAlg.classList.add('not-solved');

                }
                angleAlgsDiv.appendChild(newAlg);
            }); 
        }
    });
}

main();


