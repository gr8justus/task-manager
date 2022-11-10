'use strict';

import { app } from './component.js'

const port = process.env.PORT;

app.listen(port, () => console.log('Server is running on port ' + port));