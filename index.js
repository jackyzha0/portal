import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import {render} from "ink";
import React from "react";
import importJsx from "import-jsx";
const argv = yargs(hideBin(process.argv)).argv

const clientUrl = './cli/clients/Client'
const hostUrl = './cli/clients/Host'
const client = importJsx(argv.key ? clientUrl : hostUrl)
render(React.createElement(client, argv));