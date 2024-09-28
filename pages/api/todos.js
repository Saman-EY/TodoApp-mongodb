import connectDB from "../../utils/connectDB";
import { getSession } from "next-auth/react";
import User from "../../models/User";
import { sortTodos } from "../../utils/sortTodos";

async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: "failed", message: "Error in connecting to DB" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res
      .status(401)
      .json({ status: "failed", message: "You are not logged in!" });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return res
      .status(404)
      .json({ status: "failed", message: "User doesn't exsit!" });
  }

  switch (req.method) {
    case "POST": {
      const { title, status } = req.body;

      if (!title || !status) {
        return res
          .status(422)
          .json({ status: "failed", message: "Invaild data!" });
      }

      user.todos.push({ title, status });
      user.save();

      res.status(201).json({ status: "success", message: "Todo created!" });
      break;
    }

    case "GET": {
      const sortedData = sortTodos(user.todos);
      res.status(200).json({ status: "success", data: { todos: sortedData } });
      break;
    }

    case "PATCH": {
      const { id, status, title } = req.body;

      if (!id || (!status && !title)) {
        return res
          .status(422)
          .json({ status: "failed", message: "Invalid data!" });
      }

      const updateFields = {};
      if (status) updateFields["todos.$.status"] = status;
      if (title) updateFields["todos.$.title"] = title;

      const result = await User.updateOne(
        { "todos._id": id },
        { $set: updateFields}
      );
      console.log(result);
      res.status(200).json({ status: "success" });
      break;
    }

    case "DELETE": {
      const { id } = req.body;

      if (!id) {
        return res
          .status(422)
          .json({ status: "failed", message: "invalid data!" });
      }

      const result = await User.updateOne(
        { email: session.user.email },
        { $pull: { todos: { _id: id } } }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({ status: "success", message: "Todo deleted!" });
      } else {
        res.status(204).json({ status: "failed", message: "Todo not found!" });
      }

      break;
    }

    default:
      break;
  }

  // if (req.method === "POST") {
  //   const { title, status } = req.body;

  //   if (!title || !status) {
  //     return res
  //       .status(422)
  //       .json({ status: "failed", message: "Invaild data!" });
  //   }

  //   user.todos.push({ title, status });
  //   user.save();

  //   res.status(201).json({ status: "success", message: "Todo created!" });
  // } else if (req.method === "GET") {
  //   const sortedData = sortTodos(user.todos);
  //   res.status(200).json({ status: "success", data: { todos: sortedData } });
  // } else if (req.method === "PATCH") {
  //   const { id, status } = req.body;

  //   if (!id || !status) {
  //     return res
  //       .status(422)
  //       .json({ status: "failed", message: "Invalid data!" });
  //   }

  //   const result = await User.updateOne(
  //     { "todos._id": id },
  //     { $set: { "todos.$.status": status } }
  //   );
  //   console.log(result, "thisssssss");
  //   res.status(200).json({ status: "success" });
  // }
}

export default handler;
