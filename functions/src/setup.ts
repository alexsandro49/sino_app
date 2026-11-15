import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

initializeApp();

setGlobalOptions({ region: "southamerica-east1", maxInstances: 5 });
