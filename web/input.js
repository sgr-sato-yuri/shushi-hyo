
//メニュー表示
const menubar = ["input","chart","other"];
const menus = {};
const menuchildren = {};
const fields = ["id", "date", "item", "category", "income", "spend"];
const fd = {};
const table = document.getElementById("table");
const trows = document.getElementsByClassName("trow");
const removebtns = document.getElementsByClassName("remove");
const editbtns = document.getElementsByClassName("edit");
const spenddata = [];

var categories = [];
var today = new Date();
var total = 0;
let index = -1;
var editindex;

menubar.forEach(x => {
    menus[x] = document.getElementById(x);
    menuchildren[x] = document.getElementById(`child${x}`);
    
    if (menus[x]) {
        menus[x].addEventListener("click", function(){
            menubar.forEach(y => {
                //クリックした項目を表示
                if (menus[y]) {
                    menus[y].style.backgroundColor = "#ccc";
                }
                if(menuchildren[y]){
                    menuchildren[y].style.display = "none";
                }
            });
            //直前に表示していた項目を非表示
            if (menus[x]) {
                menus[x].style.backgroundColor = "#eee";
            }
            if(menuchildren[x]){
                menuchildren[x].style.display = "block";
            }
        });
    }
});

//todayから年を外してmm-ddに変換
var getyear = (today.getFullYear()).toString();
var getmonth = (today.getMonth() + 1).toString().padStart(2,"0");
var getdate = (today.getDate()).toString().padStart(2,"0");
today = `${getyear}-${getmonth}-${getdate}`;

//totalの計算
function calctotal(){
    var income;
    var spend;
    var total;
    var val;

    var rowelms = table.rows.length;
    //１行目の合計
    if(rowelms > 1){
        income = parseInt(table.rows[1].cells[4].innerText);
        spend = parseInt(table.rows[1].cells[5].innerText);
        isNaN(income) ? income=0: income = income;
        isNaN(spend) ? spend=0: spend = spend;
        val = income - spend;
        table.rows[1].cells[6].innerText = val;
        total = parseInt(table.rows[1].cells[6].innerText);    
    }
    try{
        for(let i=2; i<rowelms; i++){
            income = parseInt(table.rows[i].cells[4].innerText);
            spend = parseInt(table.rows[i].cells[5].innerText);       
            isNaN(income) ? income=0: income = income;
            isNaN(spend) ? spend=0: spend = spend;
            val = total + income - spend;
            table.rows[i].cells[6].innerText = val;
            total = parseInt(table.rows[i].cells[6].innerText);        
        }    
    }catch(err){
        console.error(err);
    }
}

//formの要素取得
const date = document.getElementById("in-date");
const item = document.getElementById("in-item");
const category = document.getElementById("in-category");
const income = document.getElementById("in-income");
const spend = document.getElementById("in-spend");

//テーブル追加
function newrow(form){
    let row = table.insertRow();
    let count = 0;
    fields.forEach(x => {
        let cell = row.insertCell();
        cell.className = x;
        let text;
        if(form[x]){
            text = form[x];
        }else{
            text = form[count];
        }
        text === 0 ? text = "" : text=text;
        text === undefined ? text="" : text=text;
        cell.appendChild(document.createTextNode(text));
        count++;
    })

    let totalcell = row.insertCell();
    totalcell.className = "total";
    totalcell.appendChild(document.createTextNode(form["total"]));

    let editcell = row.insertCell();
    editcell.className = "edits"
    let editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.textContent = "編集";
    let deleteButton = document.createElement("button");
    deleteButton.className = "remove";
    deleteButton.textContent = "削除";
    editcell.appendChild(editButton);
    editcell.appendChild(document.createTextNode("|"));
    editcell.appendChild(deleteButton);
    calctotal();
    assignfunc();
}

//フォーム送信
const submitbtn = document.getElementById("submitbtn");
submitbtn.addEventListener("click", async (e) => {
    e.preventDefault();

    if(date.value === ""){
        fd["date"] = today;
    }else{
        fd["date"] = date.value;
    }
    fd["item"] = item.value;
    fd["category"] = category.value;
    fd["income"] = income.value;
    fd["spend"] = spend.value;
    total = total + income.value - spend.value;
    fd["total"] = total;

    if(income.value !== "" || spend.value !== ""){
        try {
            var back = await eel.test_py(fd)();
            fd["id"] = back;
            newrow(fd);
            //後処理
            for(const key in fd){
                if(fd.hasOwnProperty(key)){
                    delete fd[key];
                }
            }
            income.style.backgroundColor = "#fff";
            spend.style.backgroundColor = "#fff";    
            income.value = "";
            spend.value = "";
        } catch (err) {
            console.error(err);
        }    
    }else{
        income.style.backgroundColor = "#ebb";
        spend.style.backgroundColor = "#ebb";
    }
})

//編集
function assignfunc(){
    for(let i=0; i<editbtns.length; i++){
        editbtns[i].removeEventListener("click", editfunc)
        editbtns[i].addEventListener("click", editfunc, {once: true})
    }
    for(let i=0; i<removebtns.length; i++){
        removebtns[i].removeEventListener("click", removefunc);
        removebtns[i].addEventListener("click", removefunc, {once: true});        
    }
}
function editfunc(e){
    var btn = e.currentTarget;
    var editcell = btn.parentNode;
    let createupdatebtn = document.createElement("button");
    createupdatebtn.className = "update";
    createupdatebtn.textContent = "更新";
    editcell.innerHTML = "";
    editcell.appendChild(createupdatebtn);
    var updatebtn = document.getElementsByClassName("update");
    var editrow = editcell.parentNode;
    var rowindex = editrow.rowIndex;
    var uniqueid = editrow.children[0].innerText;

    var n = 0;
    fields.forEach(x => {
        var val = editrow.children[n].innerText;
        if(x!=="category" && x!=="id"){
            const input = document.createElement("input");
            input.className = x;
            input.id = `edit-${x}`;
            switch (x) {
                case "date":
                    input.type = "date";
                    break;
                case "income":
                case "spend":
                    input.type = "number";
                default:
                    break;
            }
            input.value = val;
            editrow.children[n].appendChild(input);    
        }else if(x==="category"){
            var indexnum = categories.indexOf(val);
            const select = document.createElement("select");
            select.id = `edit-${x}`;
            categories.forEach(y => {
                var option = document.createElement("option");
                option.innerText = y;
                select.appendChild(option);
            })
            if(select.options[indexnum]){
                select.options[indexnum].selected = true;
            }
            editrow.children[n].appendChild(select);
        }
        n++;
    })
    if(updatebtn[0]){
        updatebtn[0].addEventListener("click", () => {
            update(rowindex, uniqueid);
        })
    }
    calctotal();
    calctotaltable();
}

//更新
async function update(index, unique) {
    var UPdate = document.getElementById("edit-date");
    var UPitem = document.getElementById("edit-item");
    var UPcategory = document.getElementById("edit-category");
    var UPincome = document.getElementById("edit-income");
    var UPspend = document.getElementById("edit-spend");

    fd["date"] = UPdate.value;
    fd["item"] = UPitem.value;
    fd["category"] = UPcategory.value;
    fd["income"] = UPincome.value;
    fd["spend"] = UPspend.value;

    if(UPincome.value !== "" || UPspend.value !== ""){
        try {
            var back = await eel.update_py(unique,fd)();
            //DOM操作
            var n = 1;
            fields.forEach(x => {
                if(x!=="id"){
                    var cell = table.rows[index].children[n];
                    cell.innerHTML = fd[x];
                    n++;    
                }
            })
            //後処理
            for(const key in fd){
                if(fd.hasOwnProperty(key)){
                    delete fd[key];
                }
            }
            var updatebtn = document.getElementsByClassName("update");
            var editcell = updatebtn[0].parentNode;
            updatebtn[0].remove();
            let editButton = document.createElement("button");
            editButton.className = "edit";
            editButton.textContent = "編集";
            let deleteButton = document.createElement("button");
            deleteButton.className = "remove";
            deleteButton.textContent = "削除";
            editcell.appendChild(editButton);
            editcell.appendChild(document.createTextNode("|"));
            editcell.appendChild(deleteButton);
            calctotal();
            calctotaltable();
        } catch (err) {
            console.error(err);
        }    
    }      
}

//削除
async function removefunc(e){
    var btn = e.currentTarget;
    var removecell = btn.parentNode;
    var removerow = removecell.parentNode;
    var index = removerow.rowIndex
    console.log(index);
    var check = window.confirm("このレコードを削除しますか？");
    if(check === true){
        removerow.remove();
        var back5 = await eel.removerow_py(index)();
        console.log(back5);
        calctotal();
        calctotaltable();          
    }
}

//chart
const updatebtn = document.getElementById("update");
const totaltable = document.getElementById("chart-table");
let chart;

async function calctotaltable(){
    var back3 = await eel.totaleachcategory_py(categories)();
    var count = 1;
    categories.forEach(x => {
        //rowが存在するとき
        if(totaltable.rows[count] && totaltable.rows[count].cells[0].innerText === x){
            totaltable.rows[count].cells[0].innerText = x;
            var totalincome = back3[x]["income"];
            totalincome===null ? totalincome=0 : totalincome=totalincome;    
            totaltable.rows[count].cells[1].innerText = totalincome;
            var totalspend = back3[x]["spend"];
            totalspend===null ? totalspend=0 : totalspend=totalspend;    
            totaltable.rows[count].cells[2].innerText = totalspend;
            var total = totalincome - totalspend;
            totaltable.rows[count].cells[3].innerText = total;
            count++;
        }else{
            //カテゴリ名
            var row = totaltable.insertRow();
            var cell = row.insertCell();
            cell.className = x;
            cell.appendChild(document.createTextNode(x));
            //収入
            cell = row.insertCell();
            cell.className = "income";
            var totalincome = back3[x]["income"];
            totalincome===null ? totalincome=0 : totalincome=totalincome;
            cell.appendChild(document.createTextNode(totalincome));
            //支出
            cell = row.insertCell();
            cell.className = "spend";
            var totalspend = back3[x]["spend"];
            totalspend===null ? totalspend=0 : totalspend=totalspend;
            cell.appendChild(document.createTextNode(totalspend));
            spenddata.push(totalspend);
            //差異
            cell = row.insertCell();
            cell.className = "total";
            var val = totalincome - totalspend;
            cell.appendChild(document.createTextNode(val));
        }
    })
    var back4 = await eel.totalspendandincome()();
    var totalincome = back4[0];
    var totalspend = back4[1];
    var total = totalincome - totalspend;
    if(totaltable.rows[count].cells[0].innerText !== "総計"){
        //合計行
        var row = totaltable.insertRow();
        var cell = row.insertCell();
        var text = "総計"
        cell.appendChild(document.createTextNode(text)); 
        cell = row.insertCell();
        cell.appendChild(document.createTextNode(totalincome)); 
        cell.className = "income";
        cell = row.insertCell();
        cell.appendChild(document.createTextNode(totalspend)); 
        cell.className = "spend";
        cell = row.insertCell();
        cell.appendChild(document.createTextNode(total)); 
        cell.className = "total";    
    }
    var row = totaltable.rows[totaltable.rows.length - 1];
    var cell = row.cells[1];
    cell.innerText = totalincome;
    cell = row.cells[2];
    cell.innerText = totalspend;
    cell = row.cells[3];
    cell.innerText = total;

    pie(categories, spenddata);
}

function pie(category, data){
    const piechart = document.getElementById("piechart").getContext("2d");
    if(chart){
        chart.destroy();
    }
    var config = {
        type: "pie",
        data: {
            labels: category,
            datasets: [{
                data: data,
                width: "90%"
            }]
        }
    }
    chart = new Chart(piechart, config);
}

updatebtn.addEventListener("click", () => {
    calctotaltable();
});


//そのた
const settedcategory = document.getElementById("setted-category");
const removecate = document.getElementById("removecate");
const addcate = document.getElementById("addcate");
const addcateinput = document.getElementById("addcateinput");
var selectcategory;

function assigncateoptfunc(){
    var cateopt = document.getElementsByClassName("categorysetting");
    Array.from(cateopt).forEach(x => {
        x.addEventListener("click", function(){
            Array.from(cateopt).forEach(y => {
                //直前に表示していた項目を選択
                if (y) {
                    y.style.backgroundColor = "#fff";
                }
            });
            if (x) {
                //クリックした項目を非選択
                selectcategory = x;
                x.style.backgroundColor = "#ebb";
            }
        });
    });    
}

function addoption(data){
    //inputのselectに入れる
    var option = document.createElement("option");
    option.innerText = data;
    category.appendChild(option);
    //そのたのカテゴリ設定に入れる
    var p = document.createElement("p");
    p.className = "categorysetting";
    p.innerText = data;
    settedcategory.appendChild(p);
    //配列のcategoriesにpush
    categories.push(data);
}
addcate.addEventListener("click", async () => {
    var val = addcateinput.value;
    await eel.addoption_py(val)();
    addoption(val);
    categories.push(val);
    addcateinput.value = "";
    assigncateoptfunc();
})

async function removeoption(data){
    //そのたのカテゴリ設定から外す
    data.remove();
    data = data.innerText;
    //配列のcategoriesを入れ替え
    categories = [];
    var array = Array.from(document.querySelectorAll("p"));
    array.forEach(x => {
        categories.push(x.innerText);
    })
    categories.pop();
    console.log(categories);
    //inputのselect optionを再作成
    var options = Array.from(document.querySelectorAll("option"));
    options.forEach(x => {
        x.remove();
    })
    categories.forEach(x => {
        var option = document.createElement("option");
        option.innerText = x;
        category.appendChild(option);    
    })
    await eel.removeoption_py(data)();
}
removecate.addEventListener("click", () => {
    removeoption(selectcategory);
})

//起動時にdb読込
document.addEventListener("DOMContentLoaded", async () => {
    console.log("start");
    var back1 = await eel.loadDB_py()();
    for(let i=0; i<back1.length; i++){
        newrow(back1[i]);
    }
    var back2 = await eel.getcategories_py()();
    for(let i=0; i<back2.length; i++){
        addoption(back2[i]);
    }
    assignfunc();
    assigncateoptfunc();
    calctotal();
    calctotaltable();
})