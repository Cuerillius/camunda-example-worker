import { Client, Variables } from "camunda-external-task-client-js";

const config = {
  baseUrl: "http://localhost:8080/engine-rest",
  asyncResponseTimeout: 10000,
};
const client = new Client(config);

client.subscribe(
  "process-data-topic",
  async ({ task, taskService }: { task: any; taskService: any }) => {
    const processVariables = task.variables.getAll();
    const inputData = processVariables.inputData;
    console.log("Input Data:", inputData);

    console.log(`Received task: ${task.id}`);

    try {
      const result = Math.floor(Math.random() * 5) + 1;
      const variables = new Variables();
      variables.set("result", result.toString());
      await taskService.complete(task, variables);
      console.log(`Completed task: ${task.id}`);
    } catch (error) {
      const err = error as Error;
      console.error("Error during task processing:", err);
      await taskService.handleFailure(task, {
        errorMessage: `Error from external service: ${err.message}`,
        errorDetails: err.stack,
        retries: 0,
        retryTimeout: 10000,
      });
    }
  }
);

console.log(
  "Camunda External Task Worker started. Subscribed to topic: process-data-topic"
);
