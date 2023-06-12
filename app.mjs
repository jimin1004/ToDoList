import express from 'express';
import mongoose from 'mongoose';
const app = express();
import { getDate } from './date.mjs';
import 'dotenv/config';
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // view engine을 ejs로 설정
app.use(express.static("public"));

mongoose.connect(process.env.DB_URL); //MongoDB Atlas로 연결
//mongoose.connect('mongodb://myUserAdmin:3674@127.0.0.1:27017/todolistDB?authSource=admin'); // local database로 연결

const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'needs item']
    }
});

const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'needs item'],
        unique: true
    },
    items: [itemsSchema]
});

const List = mongoose.model('List', listSchema);

app.get("/", (req, res) => {

    Item.find().then((documents) => {
        if (documents.length === 0) {
            console.log("[home] empty")
            Item.insertMany(defaultItems).then(() => console.log("Successfully saved dafulat items to DB.")).catch((err) => console.log(err));
            res.redirect('/');
        } else {
            console.log("[home] not empty");
            // documents.forEach((document) => {
            //     console.log(document.name);
            // });
            res.render('list', { listTitle: getDate(), items: documents }); //views/list.ejs 파일의 day를 day로. items를 itmes로 치환하여 불러오기)
        }
    }).catch((err) => console.log(err));
});

app.get('/:listName', async (req, res) => {
    const listName = req.params.listName.toLowerCase();
    const listTitle = listName.charAt(0).toUpperCase() + listName.slice(1).toLowerCase();
    //console.log(req.params.listName);

    await List.findOne({ name: listName }).then(async (foundList) => {
        if (foundList === null) {
            console.log('unique list name');

            const list = new List({
                name: listName,
                items: defaultItems
            });

            await list.save().then(() => console.log("Successfully saved new list to DB.")).catch((err) => console.log(err));
            res.redirect('/' + listName);
        } else {
            console.log('duplicated list name');
            res.render("list", { listTitle: listTitle, items: foundList.items });
        }
    });
});


app.get("/about", (req, res) => {

    res.render('about');
});

app.post('/', async (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.button.toLowerCase();
    const item = new Item({
        name: itemName
    });

    if (listName === getDate().toLowerCase()) {
        await item.save().then(() => console.log("added!"));
        res.redirect("/");
    } else {
        await List.updateOne({ name: listName }, { $push: { items: item } }).then(() => console.log("added!")).catch((err) => console.log(err));
        res.redirect('/' + listName);
    }

})

app.post('/delete', async (req, res) => {
    const listName = req.body.listTitle;
    const checkedItemId = req.body.checkbox;

    if (listName === getDate()) {
        await Item.findByIdAndRemove(checkedItemId).then(() => console.log("removed")).catch((err) => console.log(err));
        res.redirect("/");
    } else {
        await List.findOneAndUpdate({ 'items._id': checkedItemId }, { $pull: { items: { _id: checkedItemId } } }).then(() => console.log("removed")).catch((err) => console.log(err));
        res.redirect("/" + listName);
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
}); 