//the purpose of this is to extract data information of world cup 2019 from cricinfo website and
//export the data into useful frmat for the user  ----  web scraping 
//the real purpose is how to learn and experience js.
//A very good reason to make a project is to have fun.

//=============================  library Used ==============================================


//npm init -y
//npm install minimist
//npm install axios
//  ***      npm install jsdom    ***
//npm install excel4node
//npm intall puppeteer
//npm install pdf-lib   Etc...



//node CricinfoExtracter.js --dataDir=WorldCup2019 --excel=Worldcup.csv --source=https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results 

//let pup=require("puppeteer");
let min = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require("path");

//const { createPDFAcroField } = require("pdf-lib");

//download the html document using axios
//==> we need something that can request on behalf of yourself
//this is done axious 
let args = min(process.argv);
let res = axios.get(args.source);
res.then(function (response) {

//==========================================================================================================

  const puppeteer = require('puppeteer-core');
  const edgePaths = require("edge-paths");
  
  const EDGE_PATH = edgePaths.getEdgePath();
  
  (async () => {
    const browser = await puppeteer.launch({
      executablePath:EDGE_PATH,
    headless:false,
 
});
    let page = await browser.pages();
    await page[0].goto(args.source);
   // page[0].waitForNavigation();    
     browser.close();

    console.log("closed");
    })();  

//=======================================================================================================

  //console.log(response.data); //print html document
  let dom = new jsdom.JSDOM(response.data);
  let document = dom.window.document;
  // let document=fs.readFileSync(download.html,"utf-8");
  var matches = [];
  let matchdivs = document.querySelectorAll("div.match-score-block");
  //console.log(matchdivs.length);
  for (let i = 0; i < matchdivs.length; i++) {

    let matchdiv = matchdivs[i];
    let match = {
      t1: "",
      t2: "",
      t1s: "",
      t2s: "",
      result: ""

    };
    //======================================================================================
    //extracting the content div block and making Arrary of jso

    let paras = matchdiv.querySelectorAll("div.name-detail > p.name");

    match.t1 = paras[0].textContent;

    match.t2 = paras[1].textContent;

    let resultSpan = matchdiv.querySelector("div.status-text > span");

    match.result = resultSpan.textContent;

    let scoreSpan = matchdiv.querySelectorAll("div.score-detail > span.score");

    if (scoreSpan.length == 2) {
      match.t1s = scoreSpan[0].textContent;

      match.t2s = scoreSpan[1].textContent;


    }
    else if (scoreSpan.length == 1) {
      match.t1s = scoreSpan[0].textContent;
    }
    else {
      match.t1s = "";
      match.t2s = "";
    }
    matches.push(match);


  }

  //========================================================================================================= 
  // console.log(matches);
  //======================================================================================
  //making json file , just to showcase the o/p
  //writing into the file
  let matchesJSON = JSON.stringify(matches);
  fs.writeFileSync("matches.json", matchesJSON, "utf-8");

  //===============================================================================================
  //putting match in teams array of jso   
  let teams = [];
  for (let i = 0; i < matches.length; i++) {
    putMatchInteamsIfMissing(teams, matches[i]);
  }

  for (let i = 0; i < matches.length; i++) {
    putMatchInteamsInAprropriateTeams(teams, matches[i]);
  }
  //console.log(teams);

  let teamsJSON = JSON.stringify(teams);
  fs.writeFileSync("teams.json", teamsJSON, "utf-8");
  ///CFUNCTION CALL FOR CREATING ECXEL SHEET
  createExcelFile(teams);
  prepareFolderandPdfs(teams, args.dataDir);

  function prepareFolderandPdfs(teams, dataDir) {
    if (fs.existsSync(dataDir) == false) {
      fs.mkdirSync(dataDir);
    }


    for (let i = 0; i < teams.length; i++) {
      let fn = "./Worldcup2019/" + teams[i].name;
      //path.join(dataDir,teams[i].name);
      if (fs.existsSync(fn) == false) {
        //      fs.mkdirSync(fn);

        fs.mkdir(fn, (err) => {
          if (err) {
            throw err;
          }
          console.log("Directory is created.");
        });



      }
      for (let j = 0; j < teams[i].matches.length; j++) {
        let match = teams[i].matches[j];
        createPdf(fn, teams[i].name, match);
      }
    }



  }
  function createPdf(fn, homeTeam, match) {
    let pdf1 = path.join(fn, match.vs + ".pdf");
    //fs.writeFileSync(pdf1,"hello","utf-8"); 


    let byte = fs.readFileSync("Template.pdf");
    let pdfdocPromise = pdf.PDFDocument.load(byte);
    pdfdocPromise.then(function (pdfdoc) {
      let page = pdfdoc.getPage(0);
      page.drawText(homeTeam, {
        x: 320,
        y: 725,
        size: 9
      });
      page.drawText(match.vs, {
        x: 320,
        y: 710,
        size: 9
      });
      page.drawText(match.selfScore, {
        x: 343,
        y: 694,
        size: 9
      });
      page.drawText(match.oppScore, {
        x: 320,
        y: 682,
        size: 9
      });
      page.drawText(match.result, {
        x: 320,
        y: 668,
        size: 9
      });


      let chngByte = pdfdoc.save();
      chngByte.then(function (chngByte) {
        fs.writeFileSync(pdf1, chngByte);
      });

    });

  }
  //  if(fs.existsSync(fn)== false){
  //    fs.mkdirSync(fn);

  /*for(let j=0;j<teams[i].matches.length;j++)
  {
      let match=teams[i].matches[j];
      createpdf(fn,match);
*/
  //  }

  /*function createpdf(fn,match)
  {
    let filename=path.join(fn,match.vs+".pdf");
    fs.writeFileSync(filename,"","utf-8")
  }*/


  //===============================================================================================
  //putting match in teams array of jso   

  function putMatchInteamsIfMissing(teams, match) {
    let idx1 = -1;
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].name == match.t1) {
        idx1 = i;
        break;
      }
    }
    if (idx1 == -1) {
      teams.push({
        name: match.t1,
        matches: []

      });
    }

    let idx2 = -1;
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].name == match.t2) {
        idx2 = i;
        break;
      }
    }
    if (idx2 == -1) {
      teams.push({
        name: match.t2,
        matches: []

      });
    }



  }

  function putMatchInteamsInAprropriateTeams(teams, match) {
    let idx1 = -1;
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].name == match.t1) {
        idx1 = i;
        break;

      }
    }
    let team1 = teams[idx1];
    team1.matches.push({
      vs: match.t2,
      selfScore: match.t1s,
      oppScore: match.t2s,
      result: match.result
    });



    let idx2 = -1;
    for (let i = 0; i < teams.length; i++) {
      if (teams[i].name == match.t1) {
        idx2 = i;
        break;

      }
    }
    let team2 = teams[idx2];
    team2.matches.push({
      vs: match.t1,
      selfScore: match.t2s,
      oppScore: match.t1s,
      result: match.result
    });
  }
  //=======================================================================================================

  //CREATING EXCEL WORKBOOK AND SHEET TO STORE DATA FROM ARRAY OF JSO
  function createExcelFile(teams) {
    let wb = new excel4node.Workbook();
    for (let i = 0; i < teams.length; i++) {
      let sheets = wb.addWorksheet(teams[i].name);
      sheets.cell(1, 1).string("Vs");
      sheets.cell(1, 2).string("selfscore");
      sheets.cell(1, 3).string("opponent score");
      sheets.cell(1, 4).string("result");
      for (let j = 0; j < teams[i].matches.length; j++) {

        sheets.cell(2 + j, 1).string(teams[i].matches[j].vs);
        sheets.cell(2 + j, 2).string(teams[i].matches[j].selfScore);
        sheets.cell(2 + j, 3).string(teams[i].matches[j].oppScore);
        sheets.cell(2 + j, 4).string(teams[i].matches[j].result);


      }

      wb.write(args.excel);
      console.log("excel file created...ALL DONE");
    }

  }
});
   //  console.log(args.data);
  //console.log(args.source);

