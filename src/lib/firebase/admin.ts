// lib/firebaseAdmin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
 


if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:"fir-c186b",
      clientEmail:"firebase-adminsdk-fbsvc@fir-c186b.iam.gserviceaccount.com",
      privateKey:"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCP8bcFjWfdvq0\ni+97DFr9WCnyMPQl/N0qO+S2hXQYvtP6KWSaDT0iaXlFek1GZYmDUvGO0X0+WH+r\nyKxtRczQcGLsihuC9k0ALHAgwYgnYAORlkU5yvvwqEaFIqABu56mve1vrRCqrAJp\nf61oySVSUJoVdiQNpiUJSpyL0BOg5iIJWqZ9p1vWQatZr4qgbMQ6QllemKsPYoxU\nqfGSzq0cozdl99Gdx5EuTqv11Dr3ANgRflndxYijr57quGvPshMBGG85urRijbr7\nHiFH7FK9L4eUgrUeEG+URVziXjBEF2MH+LrzQFXoUKgLQMUmkIGLGPUrSonZn7t0\nvHY8Yl+7AgMBAAECggEAXi1Jnp7t9JhcyHgn7YJ6AuZhv9hYJqrIF5feNVfSh8TN\nRTYYXlAY2bxFXZgEKyNDXnYyQ0nx7O4/R+wNHRWATXaPn5r956q+fl0NJ/RsrJpy\nYH14pqJxL6aGOjolVXG/Y5wlp8VClVy79qY+TtVm0NffPJSAulVZE34nE+oX+iOA\nSvvM9wDRyXqIWKSM0PufcN1VrsItR3CaEqrVR3iajz+LHDd5vBZtU9sbw/Kfd5gV\n9Zih53Bma0C75cgYDJlmHNe+ygWomzbtfFgfqT2eAbjd9/FewrACktFdVnRjQNut\nbyww0KfjdKQH6W16ftz7iHHVvZxP7FtSubJ88/IgsQKBgQDy5u9xD/d2tRLdnFRf\npSihPC0ctwGPBHcb0XVOHkRGy/LZBoWQHg3Y+S3lWrgNL29zLQ1fv0wqks+0PB8K\nHwZC+Gren/wfSGcjjsBVZ6IkP4gZgS3359Z9MLOT+xw7HuMVmwY13JACHMnsUyMH\nX7vm2HcgaV4XNxVLnrKBB+voVwKBgQDMuTokgKN/RZjyW1xhe26LeHHnK5A+qH9e\nPs+zukxYXKDhYUdQHh9zYhkf8sxbEt8Q9UaFbBuidKh9+WIlFJ0H0WSGIOMn3BFp\njZzAw0It2gLk+QXCewatvMrHLj289msehw4Cl5wSRaQOUqsoG+Ii/jHjEi+hR2xc\nGsVGiz41PQKBgH8RaDkRTTeASjo8SbcvQy31uPPImLwkbdrTnDYdh0Ix9vypeL2H\nu17CG8xbxOTA5+CstM5d2I589sMmoGY/DJuEMQP9VXtX+PyU9PC4og2sXppZBZ8m\nXQJos8i6GG6lHc5zprAOjhdM0CUc6Lo2zqlYnBkMhfhHDJDemCr/5d1JAoGBAJZ9\nBjd09DqHP5HQBM2HvU/6vsfupv7YP6BYzbdRF/PQS1bBenlzWy0nDE8G3J+J9L1z\nf15uhLXbyUuo+TNGvtPTYXCTVkejpo0P0w2Duu8Xlg8Y2toGM3edEvZtkGaKQV3U\na0EOj2SDGsCIllZKgOW2M5e2c5q7dPUTnLZpftYFAoGBAM6LJDoonxMqJC3GKZ5R\n9jJhmAHSJdkLXX1A+acyCnHLf97biZ1FtEEkmCGzfN6rZ2Wnt0egQ9ge/4XPNOUg\nnIwMIEXo6nr2lWSGlS2F8o291+YM8aarj4qfHBbo4eiEyA1EBPpBxIuVfecGWZXk\nAUYGMBuNOOONKFjEDFfl8nDF\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, "\n"), 
    }),
  });
}

export const adminAuth = getAuth();
