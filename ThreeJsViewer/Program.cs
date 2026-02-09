//var builder = WebApplication.CreateBuilder(args);
//var app = builder.Build();

//app.MapGet("/", () => "Hello World!");

//app.Run();

using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// 1. Create a provider and register the .ply extension
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".ply"] = "application/octet-stream";

app.UseDefaultFiles();

// 2. Pass the provider into the StaticFiles middleware
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

app.Run();