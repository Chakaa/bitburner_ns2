//Do everything contract related

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("sleep");
    ns.disableLog("scan");

    await findContracts(ns);
    while(true){
        await ns.sleep(60000);
        await findContracts(ns);
    }
}

//https://bitburner.readthedocs.io/en/latest/basicgameplay/codingcontracts.html
//https://jsfiddle.net/

export async function findContracts(ns, host = "home", parent = null, pathTo = "home") {
    let servers = ns.scan(host);
    let fileMask = ".cct";
    let cc = ns.codingcontract;
    //Looking for contracts
    let files = ns.ls(host,fileMask);
    
    for (let j = 0; j < files.length; j++) {
        let f = files[j];
        await solveContract(ns,f,host,pathTo);
    }
    //Looking at connected servers for more contracts
    for (let i = 0; i < servers.length; i++) {
        let curServer = ns.getServer(servers[i]);
        if ((curServer.hostname != "home") && curServer.hostname != parent) {
            await findContracts(ns, curServer.hostname, host, pathTo+">"+curServer.hostname)
        }
    }
}

export async function solveContract(ns,filename,hostname,pathTo) {
    let cc = ns.codingcontract;
    let type = cc.getContractType(filename, hostname);
    let response = "";

    switch(type){
        case "Find Largest Prime Factor":
            response = await largestPrimeFactor(ns,filename,hostname);
            break;
        case "Subarray with Maximum Sum":
            response = await subarrayMaxSum(ns,filename,hostname);
            break;
        case "Total Ways to Sum":
            response = await totalWaysSum(ns,filename,hostname);
            break;
        case "Spiralize Matrix":
            response = await spiralizeMatrix(ns,filename,hostname);
            break;
        case "Array Jumping Game":
            response = await jumpingGame(ns,filename,hostname);
            break;
        case "Merge Overlapping Intervals":
            response = await mergeIntervals(ns,filename,hostname);
            break;
        case "Generate IP Addresses":
            response = await generateIP(ns,filename,hostname);
            break;
        case "Algorithmic Stock Trader I":
            response = await solveAlgoStock1(ns,filename,hostname);
            break;
        case "Algorithmic Stock Trader II":
            response = await solveAlgoStock2(ns,filename,hostname);
            break;
        case "Algorithmic Stock Trader III":
            response = await solveAlgoStock3(ns,filename,hostname);
            break;
        case "Algorithmic Stock Trader IV":
            response = await solveAlgoStock4(ns,filename,hostname);
            break;
        case "Minimum Path Sum in a Triangle":
            response = await minPathTriangle(ns,filename,hostname);
            break;
        case "Unique Paths in a Grid I":
            response = await uniquePath1(ns,filename,hostname);
            break;
        case "Unique Paths in a Grid II":
            response = await uniquePath2(ns,filename,hostname);
            break;
        case "Sanitize Parentheses in Expression":
            response = await sanitizeParentheses(ns,filename,hostname);
            break;
        case "Find All Valid Math Expressions":
            response = await allValidMathExpressions(ns,filename,hostname);
            break;
        default:
            response = "Unknown Contract Type"
            break;
    }
    
    if(response=="")
        ns.tprint("Solving "+filename+" on " + pathTo + "("+type+") : " + (response==""?"Contract Failed":response));
}

//Contract type = "Find Largest Prime Factor":
export async function largestPrimeFactor(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = -1;
    
    // Print the number of 2s
    // that divide inputData
    while (inputData % 2 == 0) {
        answer = 2;

        // equivalent to inputData /= 2
        inputData >>= 1;
    }
    // inputData must be odd at this point
    while (inputData % 3 == 0) {
        answer = 3;
        inputData = inputData / 3;
    }

    // now we have to iterate only for integers
    // who does not have prime factor 2 and 3
    for (let i = 5; i <= Math.sqrt(inputData); i += 6) {
        while (inputData % i == 0) {
            answer = i;
            inputData = inputData / i;
        }
        while (inputData % (i + 2) == 0) {
            answer = i + 2;
            inputData = inputData / (i + 2);
        }
    }

    // This condition is to handle the case
    // when inputData is a prime number greater than 4
    if (inputData > 4)
        answer = inputData;

    //return "I do not know the solution here : "+filename+" on "+hostname+" (largestPrimeFactor)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}

//Contract type = "Subarray with Maximum Sum":
export async function subarrayMaxSum(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);

    let maxint = Math.pow(2, 53)
    let answer = -maxint - 1
    let max_ending_here = 0
      
    for (let i = 0; i < inputData.length; i++)
    {
        max_ending_here = max_ending_here + inputData[i]
        if (answer < max_ending_here)
            answer = max_ending_here
 
        if (max_ending_here < 0)
            max_ending_here = 0
    }

    //return "I do not know the solution here : "+filename+" on "+hostname+" (subarrayMaxSum)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Total Ways to Sum":
export async function totalWaysSum(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = 0;

    let table = new Array(inputData + 1);
    for(let i = 0; i < inputData + 1; i++)
        table[i]=0;

    table[0] = 1;

    for (let i = 1; i < inputData; i++)
        for (let j = i; j <= inputData; j++)
            table[j] += table[j - i];

    answer = table[inputData]

    //return "I do not know the solution here : "+filename+" on "+hostname+" (totalWaysSum)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Spiralize Matrix":
export async function spiralizeMatrix(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = [];


    let k = 0,m=inputData.length,l = 0,n=inputData[0].length,i;
    /*
        k - starting row index
        m - ending row index
        l - starting column index
        n - ending column index
        i - iterator 
    */
 
    while (k < m && l < n) {
        // add the first row from the remaining rows
        for (i = l; i < n; ++i) {
            answer.push(inputData[k][i]);
        }
        k++;
 
        // add the last column from the remaining columns
        for (i = k; i < m; ++i) {
            answer.push(inputData[i][n - 1]);
        }
        n--;
 
        // add the last row from the remaining rows
        if (k < m) {
            for (i = n - 1; i >= l; --i) {
                answer.push(inputData[m - 1][i]);
            }
            m--;
        }
 
        // add the first column from the remaining columns
        if (l < n) {
            for (i = m - 1; i >= k; --i) {
                answer.push(inputData[i][l]);
            }
            l++;
        }
    }

    //return "I do not know the solution here : "+filename+" on "+hostname+" (spiralizeMatrix)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Array Jumping Game":
export async function jumpingGame(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = 0;
    
    const findPreds = (array) => {
        if(array.length==1){
            return true;
        }
        for(let i=array.length-2;i>=0;i--){
            if(array[i]>=array.length-i-1){
                if(findPreds(array.slice(0, i + 1))){
                    return true;
                }
            }
        }
        return false;
    };

    answer = findPreds(inputData)?1:0;

    //return "I do not know the solution here : "+filename+" on "+hostname+" (jumpingGame)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Merge Overlapping Intervals":
export async function mergeIntervals(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = [];

    // Sort Intervals in increasing order of start value
    inputData.sort((a,b) => a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0));

    let index = 0; // Stores index of last element in output array (modified arr[])

    for(let i=1;i<inputData.length;i++){
        // If this is not first Interval and overlaps with the previous one
        if (inputData[index][1] >=  inputData[i][0])
        {
            // Merge previous and current Intervals
            inputData[index][1] = Math.max(inputData[index][1], inputData[i][1]);
        }
        else {
            index++;
            inputData[index] = inputData[i];
        }
    }

    for (let i = 0; i <= index; i++){
        answer.push(inputData[i]);
    }
    
    //return "I do not know the solution here : "+filename+" on "+hostname+" (mergeIntervals)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Generate IP Addresses":
export async function generateIP(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = [];

    if(inputData.length>=4 && inputData.length<=12){
        let size = inputData.length;
        let snew = inputData;
 
        for(let i = 1; i < size - 2; i++) {
            for(let j = i + 1; j < size - 1; j++) {
                for(let k = j + 1; k < size; k++) {
                    snew = snew.substring(0, k) + "." + snew.substring(k);
                    snew = snew.substring(0, j) + "." + snew.substring(j);
                    snew = snew.substring(0, i) + "." + snew.substring(i);
                    let processed = snew;
                    snew = inputData;

                    let splitted = processed.split(".");
                    if(splitted.length!=4){
                        continue;
                    }
                    let good = true;
                    for(let l=0;l<splitted.length;l++){
                        let val=parseInt(splitted[l]);
                        if(val<0 || val>255 || val.toString().length!=splitted[l].length)
                            good=false
                    }
 
                    if (good) {
                        answer.push(processed);
                    }
                }
            }
        }
    }

    //return "I do not know the solution here : "+filename+" on "+hostname+" (generateIP)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//find maxProfit in price array, with atmost k transactions
export async function maxProfit (price, k) {
    let n = price.length

    var profit = Array(k+1).fill(0).map(x => Array(n+1).fill(0));

    // For day 0, you can't earn money irrespective of how many times you trade
    for (var i = 0; i <= k; i++)
        profit[i][0] = 0;

    // profit is 0 if we don't do any transaction (i.e. k =0)
    for (j = 0; j <= n; j++)
        profit[0][j] = 0;

    // fill the table in bottom-up fashion
    for (var i = 1; i <= k; i++)
    {
        var prevDiff = -Number.MAX_VALUE;
        for (var j = 1; j < n; j++)
        {
            prevDiff = Math.max(prevDiff,
                    profit[i - 1][j - 1] -
                    price[j - 1]);
            profit[i][j] = Math.max(profit[i][j - 1],
                        price[j] + prevDiff);
        }
    }

    return profit[k][n - 1];
}
//Contract type = "Algorithmic Stock Trader I"
export async function solveAlgoStock1(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = await maxProfit(inputData, 1);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (solveAlgoStock1)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Algorithmic Stock Trader II":
export async function solveAlgoStock2(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = await maxProfit(inputData, inputData.length);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (solveAlgoStock2)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Algorithmic Stock Trader III":
export async function solveAlgoStock3(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = await maxProfit(inputData, 2);
    
    //return "I do not know the solution here : "+filename+" on "+hostname+" (solveAlgoStock3)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Algorithmic Stock Trader IV":
export async function solveAlgoStock4(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = await maxProfit(inputData[1], inputData[0]);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (solveAlgoStock4)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Minimum Path Sum in a Triangle":
export async function minPathTriangle(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = 0;

    // For storing the result in a 1-D array, and simultaneously updating the result.
    let memo = [];
    let n = inputData.length - 1;
   
    // For the bottom row
    for(let i = 0; i < inputData[n].length; i++)
        memo[i] = inputData[n][i];
   
    // Calculation of the remaining rows, in bottom up manner.
    for(let i = inputData.length - 2; i >= 0; i--)
        for(let j = 0; j < inputData[i].length; j++)
            memo[j] = inputData[i][j] + Math.min(memo[j], memo[j + 1]);
   
    // Return the top element
    answer = memo[0];

    //return "I do not know the solution here : "+filename+" on "+hostname+" (minPathTriangle)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Unique Paths in a Grid I":
export async function uniquePath1(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = 0;

    const findMaxPath = (currentRow, currentColumn, destRow, destCol) => {
        // Base condition : if outside of matrix
        if (currentRow > destRow || currentColumn > destCol) {
            return 0;
        }
        // Successful path found
        if (currentRow === destRow && currentColumn === destCol) {
            return 1;
        }
        // Finding the number of paths that can be formed from increasing the current row's Count and Current column's count one after the other.
        const pathsInRows = findMaxPath(currentRow + 1, currentColumn, destRow, destCol);
        const pathsInColums = findMaxPath(currentRow, currentColumn + 1, destRow, destCol);
        return (pathsInRows + pathsInColums);
    };

    answer = findMaxPath(0, 0, inputData[0]-1, inputData[1]-1);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (uniquePath1)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Unique Paths in a Grid II":
export async function uniquePath2(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = 0;

    const findMaxPath = (map,currentRow, currentColumn, destRow, destCol) => {
        // Base condition : if outside of matrix, or at a 1 node (with obstacle)
        if (currentRow > destRow || currentColumn > destCol || map[currentRow][currentColumn]==1) {
            return 0;
        }
        // Successful path found
        if (currentRow === destRow && currentColumn === destCol) {
            return 1;
        }
        // Finding the number of paths that can be formed from increasing the current row's Count and Current column's count one after the other.
        const pathsInRows = findMaxPath(map,currentRow + 1, currentColumn, destRow, destCol);
        const pathsInColums = findMaxPath(map,currentRow, currentColumn + 1, destRow, destCol);
        return (pathsInRows + pathsInColums);
    };

    answer = findMaxPath(inputData, 0, 0, inputData.length-1, inputData[0].length-1);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (uniquePath2)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Sanitize Parentheses in Expression":
export async function sanitizeParentheses(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = [];

    const isParenthesis = (c) => { return ((c == '(') || (c == ')')); };
    const isValidString = (str) => {
        let cnt = 0;
        for (let i = 0; i < str.length; i++)
        {
            if (str[i] == '(')
                cnt++;
            else if (str[i] == ')')
                cnt--;
            if (cnt < 0)
                return false;
        }
        return (cnt == 0);
    };

    // visit set to ignore already visited string
    let visit = new Set();

    // queue to maintain BFS
    let q = [];
    let temp;
    let level = false;

    // pushing given string as
    // starting node into queue
    q.push(inputData);
    visit.add(inputData);
    while (q.length!=0) {
        inputData = q.shift();
        if (isValidString(inputData)) {
            answer.push(inputData);

            // If answer is found, make level true so that valid string of only that level are processed.
            level = true;
        }
        if (level)
            continue;
        for (let i = 0; i < inputData.length; i++) {
            if (!isParenthesis(inputData[i]))
                continue;

            // Removing parenthesis from inputData and pushing into queue,if not visited already
            temp = inputData.substring(0, i) + inputData.substring(i + 1);
            if (!visit.has(temp)) {
                q.push(temp);
                visit.add(temp);
            }
        }
    }

    //return "I do not know the solution here : "+filename+" on "+hostname+" (sanitizeParentheses)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}
//Contract type = "Find All Valid Math Expressions"
export async function allValidMathExpressions(ns,filename,hostname) {
    let cc = ns.codingcontract;
    let inputData = cc.getData(filename, hostname);
    let answer = [];

    const getExprUtil = (res,curExp, _input, target, pos, curVal, last) => {
        if (pos == _input.length){
            // if current value is equal to target then only add to final solution
            // if question is : all possible o/p then just push_back without condition
            if (curVal == target)
                res.push(curExp);
            
            return;
        }
        
        // loop to put operator at all positions
        for(let i=pos;i<_input.length;i++){
            // ignoring case which start with 0 as they are useless for evaluation
            if (i != pos && _input[pos] == '0')
                break;
    
            // take part of input from pos to i
            let part = _input.substring(pos, i + 1).trim();
            // take numeric value of part
            let cur = parseInt(part)
            if (pos == 0){
                // if pos is 0 then just send numeric value for next recursion
                getExprUtil(res, curExp + part, _input, target, i + 1, cur, cur)
            }else{
                // try all given binary operator for evaluation
                getExprUtil(res, curExp + "+" + part, _input, target, i + 1, curVal + cur, cur)
                getExprUtil(res, curExp + "-" + part, _input, target, i + 1, curVal - cur, -cur)
                getExprUtil(res, curExp + "*" + part, _input, target, i + 1, curVal - last + last * cur, last * cur)
            }
        }
    };
    const getExprs = (_input, target) => {
        let res=[]
        getExprUtil(res, "", _input, target, 0, 0, 0)
        return res
    };

    answer = getExprs(inputData[0],inputData[1]);

    //return "I do not know the solution here : "+filename+" on "+hostname+" (allValidMathExpressions)";
    return cc.attempt(answer,filename,hostname,{returnReward:true});
}