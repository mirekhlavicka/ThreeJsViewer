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
        public ActionResult GetMesh(string type)
        {
            var p = Polyhedron.CreateDodecahedron();

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

            var res = p.Vertices.Select((v, i) => new
            {
                pos = i, 
                v.X, v.Y, v.Z,
                vertices = p.Edges.Where(e => e.Item1 == i || e.Item2 == i).Select(e => e.Item1 == i ? e.Item2 : e.Item1)
            });


            return Ok(res);
        }

    }
}
