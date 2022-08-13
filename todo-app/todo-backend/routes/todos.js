const express = require('express');
const { getAsync, setAsync } = require('../redis')
const { Todo } = require('../mongo')
const router = express.Router();

/* GET todos listing. */
router.get('/', async (_, res) => {
  const todos = await Todo.find({})
  res.send(todos);
});


const counter = async () => {
  const x = await getAsync("count")
  return x ? setAsync("count", parseInt(x) + 1) : setAsync("count", 1)
}

/* POST todo to listing. */
router.post('/', async (req, res) => {

  counter()
  const todo = await Todo.create({
    text: req.body.text,
    done: false
  })
  res.send(todo);
});

router.get('/statistics', async(_, res) => {
  const counter = await getAsync("count")

  return res.json({"added_todos": counter || "0"})
})

const singleRouter = express.Router();

const findByIdMiddleware = async (req, res, next) => {
  const { id } = req.params
  req.todo = await Todo.findById(id)
  if (!req.todo) return res.sendStatus(404)

  next()
}

/* DELETE todo. */
singleRouter.delete('/', async (req, res) => {
  await req.todo.delete()  
  res.sendStatus(200);
});

/* GET todo. */
singleRouter.get('/', async (req, res) => {

  const todo = req.todo

  if (todo) 
  {
    return res.json(todo)
  }
  res.sendStatus(405); // Implement this
});

/* PUT todo. */
singleRouter.put('/', async (req, res) => {

  req.todo = await Todo.findByIdAndUpdate(req.todo._id, {
    text: req.body.text,
    done: req.body.done
  })

  res.json(req.todo)

});

router.use('/:id', findByIdMiddleware, singleRouter)


module.exports = router;
