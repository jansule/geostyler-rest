/* Released under the BSD 2-Clause License
 *
 * Copyright © 2020-present, meggsimum (Christian Mayer) and GeoStyler contributors
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { html } from '@elysiajs/html';
import { transFormApi, transform } from './routes/api';
import loggisch from 'loggisch';
import { versions, versionsApi } from './routes/info';
import {
  capabilities, capabilitiesApi,
  conformance, conformanceApi,
  getStyle, getStyleApi,
  postStyle, postStyleApi,
  putStyle, putStyleApi,
  deleteStyle, deleteStyleApi,
  getStyleMetadata, getStyleMetadataApi,
  putStyleMetadata, putStyleMetadataApi,
  patchStyleMetadata, patchStyleMetadataApi,
  styles, stylesApi,
  resources, resourcesApi,
  getResource, getResourceApi,
  putResource, putResourceApi,
  deleteResource, deleteResourceApi
} from './routes/ogc';
import cors from '@elysiajs/cors';

loggisch.setLogLevel('trace');

const port = process.env.NODE_API_PORT || 8888;
const host = process.env.NODE_API_HOST || `http://localhost:${port}/`;

// see https://elysiajs.com/plugins/cors for options
const corsOptions = {
  origin: process.env.CORS_ORIGIN || true,
  methods: process.env.CORS_METHODS || '*',
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS || '*',
  exposeHeaders: process.env.CORS_EXPOSE_HEADERS || '*',
};

export let app = new Elysia()
  .use(cors(corsOptions))
  .get('/', ({ redirect }) => {
    return redirect('/api-docs');
  })
  .use(swagger({
    path: '/api-docs',
    exclude: [
      '/api-docs',
      '/api-docs/json',
      '/'
    ],
    documentation: {
      info: {
        title: 'GeoStyler Rest API',
        version: '1.0.0',
        description: 'This is a REST API for the [GeoStyler](https://github.com/geostyler/geostyler) library.'
      },
      servers: [{
        url: host,
      }]
    },
  }))
  // looks like this needs to be commented out, else PUT will not work (body already used)
  // .onError((error) => {
  //   loggisch.error('Error occurred:', error);
  //   return {
  //     status: 500,
  //     message: 'Internal Server Error',
  //     error: error
  //   };
  // })
  .group('/info', (a) => a
    .use(html())
    .get('/versions', versions, versionsApi)
  )
  .group('/api', (a) => a
    .post('/transform', transform, transFormApi)
  );

if (process.env.OGC_API === 'true') {
  app = app
    .group('/ogc', a => a
      .get('/', capabilities, capabilitiesApi)
      .get('/conformance', conformance, conformanceApi)
      .get('/styles', styles, stylesApi)
      .get('/styles/:styleid', getStyle, getStyleApi)
      .post('/styles', postStyle, postStyleApi)
      .put('/styles/:styleid', putStyle, putStyleApi)
      .delete('/styles/:styleid', deleteStyle, deleteStyleApi)
      .get('/styles/:styleid/metadata', getStyleMetadata, getStyleMetadataApi)
      .put('/styles/:styleid/metadata', putStyleMetadata, putStyleMetadataApi)
      .patch('/styles/:styleid/metadata', patchStyleMetadata, patchStyleMetadataApi)
      .get('/resources', resources, resourcesApi)
      .get('/resources/:resourceId', getResource, getResourceApi)
      .put('/resources/:resourceId', putResource, putResourceApi)
      .delete('/resources/:resourceId', deleteResource, deleteResourceApi)
    );
}

app = app.listen(port);

loggisch.info(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
