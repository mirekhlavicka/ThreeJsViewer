using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Ineq3DOnline.PlatonicSolids;

namespace ThreeJsViewer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlatonicController : ControllerBase
    {
        [HttpGet("{type}")]
        public ActionResult GetMesh(string type = "dodeca")
        {
            Polyhedron p = null;

            if (type == "dodeca")
            {

                p = Polyhedron.CreateDodecahedron();

                foreach (var face in p.Faces)
                {
                    var vx = face.Sum(i => p.Vertices[i].X) / face.Length;
                    var vy = face.Sum(i => p.Vertices[i].Y) / face.Length;
                    var vz = face.Sum(i => p.Vertices[i].Z) / face.Length;

                    var rr = Math.Sqrt(vx * vx + vy * vy + vz * vz);
                    vx /= rr;
                    vy /= rr;
                    vz /= rr;

                    p.Vertices.Add(new Vec3(vx, vy, vz));

                    var j = p.Vertices.Count - 1;

                    foreach (var i in face)
                    {
                        p.Edges.Add((i, j));
                    }
                }

            }
            else
            { 
                p = Polyhedron.CreateGeodesicSphere();
            }


            var res = p.Vertices.Select((v, i) => new
            {
                pos = i, 
                v.X, v.Y, v.Z, v.Tag,
                vertices = p.Edges.Where(e => e.Item1 == i || e.Item2 == i).Select(e => e.Item1 == i ? e.Item2 : e.Item1)
            });


            return Ok(res);
        }

        [HttpGet("geoplanes")]
        public ActionResult GetGeoPlanes()
        {
            var p = Polyhedron.CreateGeodesicSphere();

            var res = p.Faces.Select(face =>
            {
                var v0 = p.Vertices[face[0]];

                var n = Vec3.Cross(p.Vertices[face[1]] - p.Vertices[face[0]], p.Vertices[face[2]] - p.Vertices[face[0]]);

                if (Vec3.Dot(new Vec3(0, 0, 0) - v0, n) > 0)
                {
                    n = new Vec3(0, 0, 0) - n;
                }

                return new 
                { 
                    v = new { v0.X, v0.Y, v0.Z },
                    n = new { n.X, n.Y, n.Z}
                };

            });

            return Ok(res);
        }
    }
}
